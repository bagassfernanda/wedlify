import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OrderSummary from '@/src/components/account/OrderSummary';
import { Alert, StatusBadge, TextAreaField } from '@/src/components/account/ui';
import { api, reportFailure, useApiData } from '@/src/lib/api';
import type { Order } from '@/src/lib/models';
import { REJECT_REASON_MAX, REJECT_REASON_MIN, rejectPaymentSchema } from '@/src/lib/validation';
import type { RejectPaymentInput } from '@/src/lib/validation';

export default function AdminOrderDetailPage({ orderId }: { orderId: string }) {
  const { data, error, loading, setData } = useApiData<{ order: Order }>(`/admin/orders/${orderId}`);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const rejectForm = useForm<RejectPaymentInput>({
    resolver: zodResolver(rejectPaymentSchema),
    defaultValues: { reason: '' },
  });

  if (loading) {
    return <p className="text-sm text-brand-ink/60">Memuat pesanan...</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{error === 'Pesanan tidak ditemukan.' ? `Pesanan ${orderId} tidak ditemukan.` : error}</Alert>
        <a href="#/admin/orders" className="font-semibold text-brand-gold hover:underline">
          Kembali ke Semua Pesanan
        </a>
      </div>
    );
  }

  const { order } = data;

  const runAction = async (action: 'approve' | 'complete', successMessage: string) => {
    const result = await api<{ order: Order }>('POST', `/admin/orders/${order.id}/${action}`);

    if (!result.ok) {
      setNotice('');
      setActionError(result.error);
      return;
    }

    setActionError('');
    setData(result.data);
    setNotice(successMessage);
  };

  const onReject = async (input: RejectPaymentInput) => {
    const result = await api<{ order: Order }>('POST', `/admin/orders/${order.id}/reject`, input);

    if (!result.ok) {
      setNotice('');
      setActionError(reportFailure(result, rejectForm));
      return;
    }

    rejectForm.reset();
    setActionError('');
    setData(result.data);
    setNotice('Pembayaran ditolak. Pesanan kembali ke status Menunggu Pembayaran.');
  };

  return (
    <div className="space-y-6">
      <div>
        <a href="#/admin/orders" className="text-sm font-semibold text-brand-ink/50 hover:text-brand-gold">
          Kembali ke Semua Pesanan
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
        <Alert tone="info" testId="reject-reason">
          Pembayaran sebelumnya ditolak dengan alasan: {order.rejectReason}
        </Alert>
      )}

      <OrderSummary order={order} />

      {order.status === 'MENUNGGU_VERIFIKASI' && (
        <section className="space-y-5 rounded-3xl border border-brand-beige bg-white p-8" data-testid="verify-box">
          <h2 className="text-lg font-serif font-bold text-brand-ink">Verifikasi Pembayaran</h2>
          <button
            type="button"
            onClick={() => runAction('approve', 'Pembayaran diterima. Pesanan berstatus Diproses.')}
            data-testid="approve-payment"
            className="btn-primary px-6 py-3 text-sm"
          >
            Terima Pembayaran
          </button>

          <form onSubmit={rejectForm.handleSubmit(onReject)} noValidate className="space-y-4 border-t border-brand-beige pt-5">
            <TextAreaField
              label="Alasan Penolakan"
              rows={3}
              placeholder="Contoh: nominal transfer tidak sesuai dengan mutasi rekening"
              hint={`${REJECT_REASON_MIN} sampai ${REJECT_REASON_MAX} karakter`}
              error={rejectForm.formState.errors.reason?.message}
              {...rejectForm.register('reason')}
            />
            <button
              type="submit"
              data-testid="reject-payment"
              className="rounded-md border border-red-300 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Tolak Pembayaran
            </button>
          </form>
        </section>
      )}

      {order.status === 'DIPROSES' && (
        <button
          type="button"
          onClick={() => runAction('complete', 'Pesanan ditandai selesai.')}
          data-testid="complete-order"
          className="btn-primary px-6 py-3 text-sm"
        >
          Tandai Selesai
        </button>
      )}
    </div>
  );
}
