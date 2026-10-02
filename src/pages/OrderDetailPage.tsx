import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OrderSummary from '@/src/components/account/OrderSummary';
import { Alert, SelectField, StatusBadge, TextField } from '@/src/components/account/ui';
import { api, reportFailure, useApiData } from '@/src/lib/api';
import { formatRupiah, toISODate } from '@/src/lib/format';
import type { Order } from '@/src/lib/models';
import { canDelete, canEdit } from '@/src/lib/orderRules';
import type { OrderStatus } from '@/src/lib/orderRules';
import { navigate } from '@/src/lib/router';
import { PAYMENT_METHODS, createPaymentSchema } from '@/src/lib/validation';
import type { PaymentInput } from '@/src/lib/validation';

const infoMessages: Record<string, string> = {
  created: 'Pesanan berhasil dibuat. Lanjutkan dengan konfirmasi pembayaran.',
  updated: 'Perubahan pesanan berhasil disimpan.',
};

const statusNotes: Partial<Record<OrderStatus, string>> = {
  MENUNGGU_VERIFIKASI: 'Konfirmasi pembayaran sudah terkirim dan sedang menunggu verifikasi admin.',
  DIPROSES: 'Pembayaran sudah diverifikasi. Undangan Anda sedang dikerjakan.',
  SELESAI: 'Pesanan selesai. Terima kasih telah memesan di Wedlify.',
};

interface PaymentFormProps {
  order: Order;
  onPaid: (order: Order) => void;
}

function PaymentForm({ order, onPaid }: PaymentFormProps) {
  const today = toISODate(new Date());
  const [formError, setFormError] = useState('');
  const schema = useMemo(
    () => createPaymentSchema(order.price.total, today, toISODate(new Date(order.createdAt))),
    [order.price.total, order.createdAt, today],
  );
  const form = useForm<PaymentInput>({
    resolver: zodResolver(schema),
    defaultValues: { method: '', senderName: '', amount: order.price.total, paidAt: today },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: PaymentInput) => {
    setFormError('');
    const result = await api<{ order: Order }>('POST', `/orders/${order.id}/payment`, data);

    if (!result.ok) {
      setFormError(reportFailure(result, form));
      return;
    }

    onPaid(result.data.order);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      data-testid="payment-form"
      className="space-y-5 rounded-3xl border border-brand-beige bg-white p-8"
    >
      <div>
        <h2 className="text-lg font-serif font-bold text-brand-ink">Konfirmasi Pembayaran</h2>
        <p className="text-sm text-brand-ink/60">
          Transfer sebesar {formatRupiah(order.price.total)}, lalu isi data pembayaran di bawah ini.
        </p>
      </div>

      {formError && <Alert tone="error">{formError}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Metode Pembayaran" error={errors.method?.message} {...register('method')}>
          <option value="">Pilih metode</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Nama Pengirim"
          placeholder="Nama pemilik rekening"
          error={errors.senderName?.message}
          {...register('senderName')}
        />
        <TextField
          label="Nominal Transfer (Rp)"
          type="number"
          inputMode="numeric"
          hint="Harus sama dengan total tagihan"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <TextField
          label="Tanggal Pembayaran"
          type="date"
          error={errors.paidAt?.message}
          {...register('paidAt')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        data-testid="payment-submit"
        className="btn-primary px-6 py-3 text-sm disabled:opacity-70"
      >
        Konfirmasi Pembayaran
      </button>
    </form>
  );
}

interface OrderDetailPageProps {
  orderId: string;
  info: string;
}

export default function OrderDetailPage({ orderId, info }: OrderDetailPageProps) {
  const { data, error, loading, setData } = useApiData<{ order: Order }>(`/orders/${orderId}`);
  const [notice, setNotice] = useState(infoMessages[info] ?? '');
  const [actionError, setActionError] = useState('');
  const [pendingAction, setPendingAction] = useState<'cancel' | 'delete' | null>(null);

  if (loading) {
    return <p className="text-sm text-brand-ink/60">Memuat pesanan...</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{error === 'Pesanan tidak ditemukan.' ? `Pesanan ${orderId} tidak ditemukan.` : error}</Alert>
        <a href="#/orders" className="font-semibold text-brand-gold hover:underline">
          Kembali ke Pesanan Saya
        </a>
      </div>
    );
  }

  const { order } = data;

  const handlePaid = (updated: Order) => {
    setActionError('');
    setData({ order: updated });
    setNotice('Konfirmasi pembayaran terkirim. Pesanan menunggu verifikasi admin.');
  };

  const handleCancel = async () => {
    const result = await api<{ order: Order }>('POST', `/orders/${order.id}/cancel`);
    setPendingAction(null);

    if (!result.ok) {
      setNotice('');
      setActionError(result.error);
      return;
    }

    setActionError('');
    setData(result.data);
    setNotice('Pesanan berhasil dibatalkan.');
  };

  const handleDelete = async () => {
    const result = await api('DELETE', `/orders/${order.id}`);
    setPendingAction(null);

    if (!result.ok) {
      setNotice('');
      setActionError(result.error);
      return;
    }

    navigate('/orders?info=deleted');
  };

  const whatsappMessage = `Halo Wedlify! Saya sudah mengonfirmasi pembayaran pesanan ${order.id} atas nama ${order.brideName} & ${order.groomName} sebesar ${formatRupiah(order.price.total)}. Mohon diverifikasi. Terima kasih!`;
  const whatsappUrl = `https://wa.me/6282228931153?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-6">
      <div>
        <a href="#/orders" className="text-sm font-semibold text-brand-ink/50 hover:text-brand-gold">
          Kembali ke Pesanan Saya
        </a>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-serif font-bold text-brand-ink" data-testid="order-id">
            Pesanan {order.id}
          </h1>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}
      {actionError && <Alert tone="error">{actionError}</Alert>}
      {order.rejectReason && (
        <Alert tone="error" testId="reject-reason">
          Pembayaran ditolak admin: {order.rejectReason}. Silakan konfirmasi ulang pembayaran Anda.
        </Alert>
      )}
      {statusNotes[order.status] && !notice && (
        <Alert tone="info" testId="status-note">
          {statusNotes[order.status]}
        </Alert>
      )}

      <OrderSummary order={order} />

      {order.status === 'MENUNGGU_VERIFIKASI' && (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block btn-secondary px-6 py-3 text-sm">
          Kirim Bukti ke WhatsApp Admin
        </a>
      )}

      {order.status === 'MENUNGGU_PEMBAYARAN' && <PaymentForm order={order} onPaid={handlePaid} />}

      {(canEdit(order.status) || canDelete(order.status)) && (
        <section className="flex flex-wrap items-center gap-3">
          {canEdit(order.status) && pendingAction === null && (
            <>
              <a href={`#/orders/${order.id}/edit`} data-testid="edit-order" className="btn-secondary px-6 py-3 text-sm">
                Ubah Pesanan
              </a>
              <button
                type="button"
                onClick={() => setPendingAction('cancel')}
                data-testid="cancel-order"
                className="rounded-md border border-red-300 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Batalkan Pesanan
              </button>
            </>
          )}

          {canDelete(order.status) && pendingAction === null && (
            <button
              type="button"
              onClick={() => setPendingAction('delete')}
              data-testid="delete-order"
              className="rounded-md border border-red-300 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Hapus Pesanan
            </button>
          )}

          {pendingAction !== null && (
            <div
              role="alertdialog"
              aria-label="Konfirmasi tindakan"
              data-testid="confirm-box"
              className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>
                {pendingAction === 'cancel'
                  ? 'Batalkan pesanan ini? Pesanan yang dibatalkan tidak dapat diaktifkan kembali.'
                  : 'Hapus pesanan ini secara permanen?'}
              </span>
              <button
                type="button"
                onClick={pendingAction === 'cancel' ? handleCancel : handleDelete}
                data-testid="confirm-yes"
                className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
              >
                {pendingAction === 'cancel' ? 'Ya, batalkan' : 'Ya, hapus'}
              </button>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                data-testid="confirm-no"
                className="rounded-md border border-red-300 px-4 py-2 font-semibold hover:bg-white"
              >
                Tidak
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
