import { Plus } from 'lucide-react';
import OrderList from '@/src/components/account/OrderList';
import { Alert } from '@/src/components/account/ui';
import { useApiData } from '@/src/lib/api';
import type { Order } from '@/src/lib/models';

const infoMessages: Record<string, string> = {
  deleted: 'Pesanan berhasil dihapus.',
};

export default function OrdersPage({ info }: { info: string }) {
  const { data, error, loading } = useApiData<{ orders: Order[] }>('/orders');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold text-brand-ink">Pesanan Saya</h1>
        <a
          href="#/orders/new"
          data-testid="new-order-link"
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm"
        >
          <Plus className="h-4 w-4" />
          Buat Pesanan
        </a>
      </div>

      {infoMessages[info] && <Alert tone="success">{infoMessages[info]}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {loading && <p className="text-sm text-brand-ink/60">Memuat pesanan...</p>}

      {data && (
        <OrderList
          orders={data.orders}
          hrefFor={(order) => `#/orders/${order.id}`}
          searchPlaceholder="Cari nomor pesanan, nama pengantin, atau tema"
          emptyMessage="Anda belum memiliki pesanan. Tekan Buat Pesanan untuk memulai."
        />
      )}
    </div>
  );
}
