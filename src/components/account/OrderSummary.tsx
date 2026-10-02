import { formatDate, formatRupiah, toISODate } from '@/src/lib/format';
import type { Order } from '@/src/lib/models';

function Item({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-brand-ink/50">{label}</dt>
      <dd className="font-semibold text-brand-ink whitespace-pre-line break-words">{value}</dd>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brand-ink/60">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

// Detail, rincian harga, dan data pembayaran sebuah pesanan.
// Dipakai halaman pelanggan dan halaman admin.
export default function OrderSummary({ order }: { order: Order }) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-brand-beige bg-white p-8">
          <h2 className="mb-4 text-lg font-serif font-bold text-brand-ink">Detail Pesanan</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {order.customer && (
              <>
                <Item label="Pelanggan" value={order.customer.name} />
                <Item label="Kontak pelanggan" value={`${order.customer.email}\n${order.customer.phone}`} />
              </>
            )}
            <Item label="Pengantin" value={`${order.brideName} & ${order.groomName}`} />
            <Item label="Tanggal pernikahan" value={formatDate(order.weddingDate)} />
            <Item label="Lokasi" value={order.location} />
            <Item label="Jumlah tamu" value={`${order.guestCount} orang`} />
            <Item label="Tema undangan" value={order.templateName} />
            <Item label="Paket" value={order.packageName} />
            <Item label="Dibuat pada" value={formatDate(toISODate(new Date(order.createdAt)))} />
            <Item label="Catatan desain" value={order.designNotes || '-'} wide />
          </dl>
        </section>

        <aside className="h-fit rounded-3xl border border-brand-beige bg-white p-8">
          <h2 className="mb-4 text-lg font-serif font-bold text-brand-ink">Rincian Harga</h2>
          <dl className="space-y-3 text-sm">
            <PriceRow label={`Paket ${order.packageName}`} value={formatRupiah(order.price.packagePrice)} />
            <PriceRow
              label={`Cetak tambahan (${order.extraPrintQty} lembar)`}
              value={formatRupiah(order.price.printCost)}
            />
            <PriceRow label={`Diskon ${order.promoCode}`} value={`- ${formatRupiah(order.price.discount)}`} />
            <div className="flex justify-between gap-4 border-t border-brand-beige pt-3 text-base">
              <dt className="font-bold text-brand-ink">Total</dt>
              <dd className="font-bold text-brand-gold" data-testid="order-total">
                {formatRupiah(order.price.total)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {order.payment && (
        <section className="rounded-3xl border border-brand-beige bg-white p-8" data-testid="payment-info">
          <h2 className="mb-4 text-lg font-serif font-bold text-brand-ink">Pembayaran</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-4">
            <Item label="Metode" value={order.payment.method} />
            <Item label="Nama pengirim" value={order.payment.senderName} />
            <Item label="Nominal" value={formatRupiah(order.payment.amount)} />
            <Item label="Tanggal" value={formatDate(order.payment.paidAt)} />
          </dl>
        </section>
      )}
    </>
  );
}
