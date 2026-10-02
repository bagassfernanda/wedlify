import { Alert, StatusBadge } from '@/src/components/account/ui';
import { useApiData } from '@/src/lib/api';
import { formatRupiah } from '@/src/lib/format';
import type { AdminSummary, Order } from '@/src/lib/models';
import { ORDER_STATUSES } from '@/src/lib/orderRules';

function StatCard({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="rounded-3xl border border-brand-beige bg-white p-6">
      <p className="text-sm text-brand-ink/50">{label}</p>
      <p className="mt-1 text-2xl font-serif font-bold text-brand-ink" data-testid={testId}>
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const summary = useApiData<{ summary: AdminSummary }>('/admin/summary');
  const orders = useApiData<{ orders: Order[] }>('/admin/orders');
  const waitingOrders = orders.data?.orders.filter((order) => order.status === 'MENUNGGU_VERIFIKASI') ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brand-ink">Dashboard Admin</h1>

      {(summary.error || orders.error) && <Alert tone="error">{summary.error || orders.error}</Alert>}
      {summary.loading && <p className="text-sm text-brand-ink/60">Memuat ringkasan...</p>}

      {summary.data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Pelanggan terdaftar" value={String(summary.data.summary.customerCount)} testId="stat-customers" />
            <StatCard label="Total pesanan" value={String(summary.data.summary.orderCount)} testId="stat-orders" />
            <StatCard
              label="Pendapatan terverifikasi"
              value={formatRupiah(summary.data.summary.revenue)}
              testId="stat-revenue"
            />
          </div>

          <section className="rounded-3xl border border-brand-beige bg-white p-8">
            <h2 className="mb-4 text-lg font-serif font-bold text-brand-ink">Pesanan per Status</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {ORDER_STATUSES.map((status) => (
                <li key={status} className="flex items-center justify-between gap-4 rounded-xl bg-brand-pastel px-4 py-3">
                  <StatusBadge status={status} />
                  <span className="font-bold text-brand-ink" data-testid={`stat-${status}`}>
                    {summary.data?.summary.byStatus[status]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section className="rounded-3xl border border-brand-beige bg-white p-8">
        <h2 className="mb-4 text-lg font-serif font-bold text-brand-ink">Perlu Diverifikasi</h2>
        {waitingOrders.length === 0 ? (
          <p className="text-sm text-brand-ink/60" data-testid="waiting-empty">
            Tidak ada pembayaran yang menunggu verifikasi.
          </p>
        ) : (
          <ul className="divide-y divide-brand-beige" data-testid="waiting-list">
            {waitingOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <strong className="text-brand-ink">{order.id}</strong> oleh {order.customer?.name}, total{' '}
                  {formatRupiah(order.price.total)}
                </span>
                <a href={`#/admin/orders/${order.id}`} className="font-semibold text-brand-gold hover:underline">
                  Periksa
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
