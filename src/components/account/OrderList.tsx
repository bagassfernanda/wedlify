import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { StatusBadge } from '@/src/components/account/ui';
import { formatDate, formatRupiah } from '@/src/lib/format';
import type { Order } from '@/src/lib/models';
import { ORDER_STATUSES, STATUS_LABELS, filterOrders } from '@/src/lib/orderRules';
import type { OrderFilter } from '@/src/lib/orderRules';

interface OrderListProps {
  orders: Order[];
  hrefFor: (order: Order) => string;
  searchPlaceholder: string;
  emptyMessage: string;
}

// Daftar pesanan dengan pencarian dan filter status.
export default function OrderList({ orders, hrefFor, searchPlaceholder, emptyMessage }: OrderListProps) {
  const [filter, setFilter] = useState<OrderFilter>({ query: '', status: 'SEMUA' });
  const visibleOrders = useMemo(() => filterOrders(orders, filter), [orders, filter]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
          <input
            type="search"
            aria-label="Cari pesanan"
            data-testid="order-search"
            placeholder={searchPlaceholder}
            value={filter.query}
            onChange={(event) => setFilter({ ...filter, query: event.target.value })}
            className="w-full rounded-xl border border-brand-beige bg-white py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
          />
        </div>
        <select
          aria-label="Filter status"
          data-testid="order-status-filter"
          value={filter.status}
          onChange={(event) => setFilter({ ...filter, status: event.target.value as OrderFilter['status'] })}
          className="rounded-xl border border-brand-beige bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          <option value="SEMUA">Semua status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {orders.length === 0 && (
        <div data-testid="orders-empty" className="rounded-3xl border border-brand-beige bg-white p-10 text-center text-brand-ink/70">
          {emptyMessage}
        </div>
      )}

      {orders.length > 0 && visibleOrders.length === 0 && (
        <div data-testid="orders-no-match" className="rounded-3xl border border-brand-beige bg-white p-10 text-center text-brand-ink/70">
          Tidak ada pesanan yang cocok dengan pencarian atau filter.
        </div>
      )}

      {visibleOrders.length > 0 && (
        <ul className="space-y-4" data-testid="order-list">
          {visibleOrders.map((order) => (
            <li key={order.id}>
              <a
                href={hrefFor(order)}
                data-testid={`order-item-${order.id}`}
                className="block rounded-3xl border border-brand-beige bg-white p-6 transition-all hover:border-brand-gold/50 hover:shadow-lg hover:shadow-brand-gold/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-brand-gold">{order.id}</p>
                    <p className="text-lg font-serif font-bold text-brand-ink">
                      {order.brideName} & {order.groomName}
                    </p>
                    {order.customer && (
                      <p className="text-sm text-brand-ink/60">
                        Pelanggan: {order.customer.name} ({order.customer.email})
                      </p>
                    )}
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-brand-ink/50">Tanggal pernikahan</dt>
                    <dd className="font-semibold text-brand-ink">{formatDate(order.weddingDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-ink/50">Tema</dt>
                    <dd className="font-semibold text-brand-ink">{order.templateName}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-ink/50">Paket</dt>
                    <dd className="font-semibold text-brand-ink">{order.packageName}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-ink/50">Total</dt>
                    <dd className="font-semibold text-brand-ink">{formatRupiah(order.price.total)}</dd>
                  </div>
                </dl>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
