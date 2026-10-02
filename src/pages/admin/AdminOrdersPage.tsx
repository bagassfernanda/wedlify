import OrderList from '@/src/components/account/OrderList';
import { Alert } from '@/src/components/account/ui';
import { useApiData } from '@/src/lib/api';
import type { Order } from '@/src/lib/models';

export default function AdminOrdersPage() {
  const { data, error, loading } = useApiData<{ orders: Order[] }>('/admin/orders');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brand-ink">Semua Pesanan</h1>

      {error && <Alert tone="error">{error}</Alert>}
      {loading && <p className="text-sm text-brand-ink/60">Memuat pesanan...</p>}

      {data && (
        <OrderList
          orders={data.orders}
          hrefFor={(order) => `#/admin/orders/${order.id}`}
          searchPlaceholder="Cari nomor pesanan, nama pengantin, tema, atau pelanggan"
          emptyMessage="Belum ada pesanan dari pelanggan."
        />
      )}
    </div>
  );
}
