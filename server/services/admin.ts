import type { AdminSummary, Customer, Order, Promo } from '../../src/lib/models';
import { ORDER_STATUSES, canTransition } from '../../src/lib/orderRules';
import type { OrderStatus } from '../../src/lib/orderRules';
import { customerStatusSchema, promoSchema, rejectPaymentSchema } from '../../src/lib/validation';
import { execute, queryAll, queryOne } from '../db';
import type { Db } from '../db';
import { HttpError, parseInput } from '../errors';
import { SELECT_ORDER, parseOrderCode, toOrder } from './orders';
import type { OrderRow } from './orders';

interface PromoRow {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_subtotal: number;
  max_discount: number | null;
  is_active: number;
}

interface CustomerRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: number;
  created_at: string;
  order_count: number;
}

function toPromo(row: PromoRow): Promo {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    minSubtotal: row.min_subtotal,
    maxDiscount: row.max_discount,
    isActive: row.is_active === 1,
  };
}

async function findOrder(db: Db, code: string): Promise<OrderRow> {
  const row = await queryOne<OrderRow>(db, `${SELECT_ORDER} WHERE o.id = ?`, parseOrderCode(code));

  if (!row) {
    throw new HttpError(404, 'Pesanan tidak ditemukan.');
  }

  return row;
}

export async function getSummary(db: Db): Promise<AdminSummary> {
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>;
  const rows = await queryAll<{ status: OrderStatus; total: number }>(
    db,
    'SELECT status, COUNT(*) AS total FROM orders GROUP BY status',
  );

  for (const row of rows) {
    byStatus[row.status] = row.total;
  }

  // Pendapatan dihitung dari pesanan yang pembayarannya sudah diterima admin.
  const revenue = await queryOne<{ total: number | null }>(
    db,
    "SELECT SUM(total) AS total FROM orders WHERE status IN ('DIPROSES', 'SELESAI')",
  );
  const customers = await queryOne<{ total: number }>(
    db,
    "SELECT COUNT(*) AS total FROM users WHERE role = 'customer'",
  );

  return {
    customerCount: customers?.total ?? 0,
    orderCount: rows.reduce((sum, row) => sum + row.total, 0),
    revenue: revenue?.total ?? 0,
    byStatus,
  };
}

export async function listAllOrders(db: Db): Promise<Order[]> {
  const rows = await queryAll<OrderRow>(db, `${SELECT_ORDER} ORDER BY o.id DESC`);
  return rows.map((row) => toOrder(row, true));
}

export async function getAnyOrder(db: Db, code: string): Promise<Order> {
  return toOrder(await findOrder(db, code), true);
}

async function changeStatus(db: Db, code: string, to: OrderStatus, errorMessage: string, now: Date): Promise<OrderRow> {
  const row = await findOrder(db, code);

  if (!canTransition(row.status, to, 'admin')) {
    throw new HttpError(409, errorMessage);
  }

  await execute(db, 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', to, now.toISOString(), row.id);
  return row;
}

export async function approvePayment(db: Db, code: string, now = new Date()): Promise<Order> {
  await changeStatus(db, code, 'DIPROSES', 'Hanya pesanan berstatus Menunggu Verifikasi yang dapat diterima.', now);
  return getAnyOrder(db, code);
}

export async function rejectPayment(db: Db, code: string, input: unknown, now = new Date()): Promise<Order> {
  const { reason } = parseInput(rejectPaymentSchema, input);
  const row = await changeStatus(
    db,
    code,
    'MENUNGGU_PEMBAYARAN',
    'Hanya pesanan berstatus Menunggu Verifikasi yang dapat ditolak.',
    now,
  );

  await execute(
    db,
    `UPDATE orders SET reject_reason = ?, payment_method = NULL, payment_sender = NULL,
       payment_amount = NULL, payment_date = NULL
     WHERE id = ?`,
    reason,
    row.id,
  );

  return getAnyOrder(db, code);
}

export async function completeOrder(db: Db, code: string, now = new Date()): Promise<Order> {
  await changeStatus(db, code, 'SELESAI', 'Hanya pesanan berstatus Diproses yang dapat diselesaikan.', now);
  return getAnyOrder(db, code);
}

export async function listCustomers(db: Db): Promise<Customer[]> {
  const rows = await queryAll<CustomerRow>(
    db,
    `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
       (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
     FROM users u WHERE u.role = 'customer' ORDER BY u.id DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    orderCount: row.order_count,
  }));
}

export async function setCustomerActive(db: Db, customerId: number, input: unknown): Promise<Customer> {
  const { isActive } = parseInput(customerStatusSchema, input);
  const { changes } = await execute(
    db,
    "UPDATE users SET is_active = ? WHERE id = ? AND role = 'customer'",
    isActive ? 1 : 0,
    customerId,
  );

  if (changes === 0) {
    throw new HttpError(404, 'Pelanggan tidak ditemukan.');
  }

  // Pelanggan yang dinonaktifkan langsung dikeluarkan dari semua sesi.
  if (!isActive) {
    await execute(db, 'DELETE FROM sessions WHERE user_id = ?', customerId);
  }

  const customers = await listCustomers(db);
  return customers.find((customer) => customer.id === customerId)!;
}

export async function listPromos(db: Db): Promise<Promo[]> {
  const rows = await queryAll<PromoRow>(db, 'SELECT * FROM promos ORDER BY id');
  return rows.map(toPromo);
}

async function assertCodeAvailable(db: Db, code: string, exceptId = 0): Promise<void> {
  if (await queryOne(db, 'SELECT id FROM promos WHERE code = ? AND id <> ?', code, exceptId)) {
    throw new HttpError(409, `Kode promo ${code} sudah ada.`, 'code');
  }
}

export async function createPromo(db: Db, input: unknown, now = new Date()): Promise<Promo> {
  const promo = parseInput(promoSchema, input);

  await assertCodeAvailable(db, promo.code);

  const { lastId } = await execute(
    db,
    `INSERT INTO promos (code, type, value, min_subtotal, max_discount, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    promo.code,
    promo.type,
    promo.value,
    promo.minSubtotal,
    promo.maxDiscount,
    promo.isActive ? 1 : 0,
    now.toISOString(),
  );

  return { id: lastId, ...promo };
}

export async function updatePromo(db: Db, promoId: number, input: unknown): Promise<Promo> {
  if (!(await queryOne(db, 'SELECT id FROM promos WHERE id = ?', promoId))) {
    throw new HttpError(404, 'Kode promo tidak ditemukan.');
  }

  const promo = parseInput(promoSchema, input);

  await assertCodeAvailable(db, promo.code, promoId);
  await execute(
    db,
    `UPDATE promos SET code = ?, type = ?, value = ?, min_subtotal = ?, max_discount = ?, is_active = ?
     WHERE id = ?`,
    promo.code,
    promo.type,
    promo.value,
    promo.minSubtotal,
    promo.maxDiscount,
    promo.isActive ? 1 : 0,
    promoId,
  );

  return { id: promoId, ...promo };
}

export async function deletePromo(db: Db, promoId: number): Promise<void> {
  const { changes } = await execute(db, 'DELETE FROM promos WHERE id = ?', promoId);

  if (changes === 0) {
    throw new HttpError(404, 'Kode promo tidak ditemukan.');
  }
}
