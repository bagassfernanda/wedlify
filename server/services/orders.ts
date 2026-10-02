import { toISODate } from '../../src/lib/format';
import type { Order } from '../../src/lib/models';
import { MAX_UNPAID_ORDERS, canDelete, canEdit, canTransition } from '../../src/lib/orderRules';
import type { OrderStatus } from '../../src/lib/orderRules';
import { calculateOrderTotal } from '../../src/lib/pricing';
import type { PriceBreakdown, PriceInput, PromoRule } from '../../src/lib/pricing';
import { createOrderSchema, createPaymentSchema, quoteSchema } from '../../src/lib/validation';
import { execute, queryAll, queryOne } from '../db';
import type { Db } from '../db';
import { HttpError, parseInput } from '../errors';

export interface OrderRow {
  id: number;
  user_id: number;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  location: string;
  template_name: string;
  package_name: string;
  guest_count: number;
  extra_print_qty: number;
  promo_code: string;
  design_notes: string;
  package_price: number;
  print_cost: number;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_sender: string | null;
  payment_amount: number | null;
  payment_date: string | null;
  reject_reason: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

interface PromoRow {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_subtotal: number;
  max_discount: number | null;
}

export const SELECT_ORDER = `
  SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
  FROM orders o JOIN users u ON u.id = o.user_id`;

export function orderCode(id: number): string {
  return `WDL-${String(id).padStart(4, '0')}`;
}

export function parseOrderCode(code: string): number {
  const match = /^WDL-(\d{4,9})$/.exec(code);
  return match ? Number(match[1]) : 0;
}

export function toOrder(row: OrderRow, includeCustomer = false): Order {
  const order: Order = {
    id: orderCode(row.id),
    userId: row.user_id,
    brideName: row.bride_name,
    groomName: row.groom_name,
    weddingDate: row.wedding_date,
    location: row.location,
    templateName: row.template_name,
    packageName: row.package_name,
    guestCount: row.guest_count,
    extraPrintQty: row.extra_print_qty,
    promoCode: row.promo_code,
    designNotes: row.design_notes,
    price: {
      packagePrice: row.package_price,
      printCost: row.print_cost,
      subtotal: row.subtotal,
      discount: row.discount,
      total: row.total,
    },
    status: row.status,
    payment:
      row.payment_method !== null
        ? {
            method: row.payment_method,
            senderName: row.payment_sender ?? '',
            amount: row.payment_amount ?? 0,
            paidAt: row.payment_date ?? '',
          }
        : null,
    rejectReason: row.reject_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (includeCustomer) {
    order.customer = { name: row.customer_name, email: row.customer_email, phone: row.customer_phone };
  }

  return order;
}

async function findOwnOrder(db: Db, userId: number, code: string): Promise<OrderRow> {
  const row = await queryOne<OrderRow>(
    db,
    `${SELECT_ORDER} WHERE o.id = ? AND o.user_id = ?`,
    parseOrderCode(code),
    userId,
  );

  if (!row) {
    throw new HttpError(404, 'Pesanan tidak ditemukan.');
  }

  return row;
}

async function findActivePromo(db: Db, promoCode: string): Promise<PromoRule | null> {
  const row = await queryOne<PromoRow>(
    db,
    'SELECT code, type, value, min_subtotal, max_discount FROM promos WHERE code = ? AND is_active = 1',
    promoCode.trim().toUpperCase(),
  );

  return row
    ? { code: row.code, type: row.type, value: row.value, minSubtotal: row.min_subtotal, maxDiscount: row.max_discount }
    : null;
}

async function priceFor(db: Db, input: PriceInput): Promise<PriceBreakdown> {
  const price = calculateOrderTotal(input, await findActivePromo(db, input.promoCode));

  if (!price.ok) {
    throw new HttpError(422, price.error, price.field);
  }

  const { packagePrice, printCost, subtotal, discount, total, promoCode } = price;
  return { packagePrice, printCost, subtotal, discount, total, promoCode };
}

export function quoteOrder(db: Db, input: unknown): Promise<PriceBreakdown> {
  return priceFor(db, parseInput(quoteSchema, input));
}

export async function listOrders(db: Db, userId: number): Promise<Order[]> {
  const rows = await queryAll<OrderRow>(db, `${SELECT_ORDER} WHERE o.user_id = ? ORDER BY o.id DESC`, userId);
  return rows.map((row) => toOrder(row));
}

export async function getOrder(db: Db, userId: number, code: string): Promise<Order> {
  return toOrder(await findOwnOrder(db, userId, code));
}

export async function createOrder(db: Db, userId: number, input: unknown, now = new Date()): Promise<Order> {
  const data = parseInput(createOrderSchema(toISODate(now)), input);
  const price = await priceFor(db, data);
  const unpaid = await queryOne<{ total: number }>(
    db,
    "SELECT COUNT(*) AS total FROM orders WHERE user_id = ? AND status = 'MENUNGGU_PEMBAYARAN'",
    userId,
  );

  if ((unpaid?.total ?? 0) >= MAX_UNPAID_ORDERS) {
    throw new HttpError(
      409,
      `Maksimal ${MAX_UNPAID_ORDERS} pesanan berstatus Menunggu Pembayaran. Selesaikan atau batalkan pesanan lain terlebih dahulu.`,
    );
  }

  const timestamp = now.toISOString();
  const { lastId } = await execute(
    db,
    `INSERT INTO orders (
       user_id, bride_name, groom_name, wedding_date, location, template_name, package_name,
       guest_count, extra_print_qty, promo_code, design_notes,
       package_price, print_cost, subtotal, discount, total, status, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MENUNGGU_PEMBAYARAN', ?, ?)`,
    userId,
    data.brideName,
    data.groomName,
    data.weddingDate,
    data.location,
    data.templateName,
    data.packageName,
    data.guestCount,
    data.extraPrintQty,
    price.promoCode,
    data.designNotes,
    price.packagePrice,
    price.printCost,
    price.subtotal,
    price.discount,
    price.total,
    timestamp,
    timestamp,
  );

  return getOrder(db, userId, orderCode(lastId));
}

export async function updateOrder(
  db: Db,
  userId: number,
  code: string,
  input: unknown,
  now = new Date(),
): Promise<Order> {
  const row = await findOwnOrder(db, userId, code);

  if (!canEdit(row.status)) {
    throw new HttpError(409, 'Pesanan hanya dapat diubah saat berstatus Menunggu Pembayaran.');
  }

  const data = parseInput(createOrderSchema(toISODate(now)), input);
  const price = await priceFor(db, data);

  await execute(
    db,
    `UPDATE orders SET
       bride_name = ?, groom_name = ?, wedding_date = ?, location = ?, template_name = ?, package_name = ?,
       guest_count = ?, extra_print_qty = ?, promo_code = ?, design_notes = ?,
       package_price = ?, print_cost = ?, subtotal = ?, discount = ?, total = ?, updated_at = ?
     WHERE id = ?`,
    data.brideName,
    data.groomName,
    data.weddingDate,
    data.location,
    data.templateName,
    data.packageName,
    data.guestCount,
    data.extraPrintQty,
    price.promoCode,
    data.designNotes,
    price.packagePrice,
    price.printCost,
    price.subtotal,
    price.discount,
    price.total,
    now.toISOString(),
    row.id,
  );

  return getOrder(db, userId, code);
}

export async function confirmPayment(
  db: Db,
  userId: number,
  code: string,
  input: unknown,
  now = new Date(),
): Promise<Order> {
  const row = await findOwnOrder(db, userId, code);

  if (!canTransition(row.status, 'MENUNGGU_VERIFIKASI', 'customer')) {
    throw new HttpError(409, 'Pembayaran hanya dapat dikonfirmasi saat pesanan berstatus Menunggu Pembayaran.');
  }

  const schema = createPaymentSchema(row.total, toISODate(now), toISODate(new Date(row.created_at)));
  const payment = parseInput(schema, input);

  await execute(
    db,
    `UPDATE orders SET status = 'MENUNGGU_VERIFIKASI', payment_method = ?, payment_sender = ?,
       payment_amount = ?, payment_date = ?, reject_reason = '', updated_at = ?
     WHERE id = ?`,
    payment.method,
    payment.senderName,
    payment.amount,
    payment.paidAt,
    now.toISOString(),
    row.id,
  );

  return getOrder(db, userId, code);
}

export async function cancelOrder(db: Db, userId: number, code: string, now = new Date()): Promise<Order> {
  const row = await findOwnOrder(db, userId, code);

  if (!canTransition(row.status, 'DIBATALKAN', 'customer')) {
    throw new HttpError(
      409,
      'Pesanan hanya dapat dibatalkan saat berstatus Menunggu Pembayaran. Hubungi admin untuk bantuan.',
    );
  }

  await execute(db, "UPDATE orders SET status = 'DIBATALKAN', updated_at = ? WHERE id = ?", now.toISOString(), row.id);
  return getOrder(db, userId, code);
}

export async function deleteOrder(db: Db, userId: number, code: string): Promise<void> {
  const row = await findOwnOrder(db, userId, code);

  if (!canDelete(row.status)) {
    throw new HttpError(409, 'Hanya pesanan berstatus Dibatalkan yang dapat dihapus.');
  }

  await execute(db, 'DELETE FROM orders WHERE id = ?', row.id);
}
