export const ORDER_STATUSES = [
  'MENUNGGU_PEMBAYARAN',
  'MENUNGGU_VERIFIKASI',
  'DIPROSES',
  'SELESAI',
  'DIBATALKAN',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type Role = 'customer' | 'admin';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  MENUNGGU_PEMBAYARAN: 'Menunggu Pembayaran',
  MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi',
  DIPROSES: 'Diproses',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};

export const MAX_UNPAID_ORDERS = 3;

// Perpindahan status yang sah beserta role yang boleh melakukannya.
const TRANSITIONS: { from: OrderStatus; to: OrderStatus; role: Role }[] = [
  { from: 'MENUNGGU_PEMBAYARAN', to: 'MENUNGGU_VERIFIKASI', role: 'customer' },
  { from: 'MENUNGGU_PEMBAYARAN', to: 'DIBATALKAN', role: 'customer' },
  { from: 'MENUNGGU_VERIFIKASI', to: 'DIPROSES', role: 'admin' },
  { from: 'MENUNGGU_VERIFIKASI', to: 'MENUNGGU_PEMBAYARAN', role: 'admin' },
  { from: 'DIPROSES', to: 'SELESAI', role: 'admin' },
];

export function canTransition(from: OrderStatus, to: OrderStatus, role: Role): boolean {
  return TRANSITIONS.some((rule) => rule.from === from && rule.to === to && rule.role === role);
}

export function canEdit(status: OrderStatus): boolean {
  return status === 'MENUNGGU_PEMBAYARAN';
}

export function canDelete(status: OrderStatus): boolean {
  return status === 'DIBATALKAN';
}

export interface OrderFilter {
  query: string;
  status: OrderStatus | 'SEMUA';
}

interface FilterableOrder {
  id: string;
  status: OrderStatus;
  brideName: string;
  groomName: string;
  templateName: string;
  customer?: { name: string; email: string };
}

export function filterOrders<T extends FilterableOrder>(orders: T[], { query, status }: OrderFilter): T[] {
  const keyword = query.trim().toLowerCase();

  return orders.filter((order) => {
    if (status !== 'SEMUA' && order.status !== status) {
      return false;
    }

    if (keyword === '') {
      return true;
    }

    const searchable = [order.id, order.brideName, order.groomName, order.templateName];

    if (order.customer) {
      searchable.push(order.customer.name, order.customer.email);
    }

    return searchable.some((value) => value.toLowerCase().includes(keyword));
  });
}
