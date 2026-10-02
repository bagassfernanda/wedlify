import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, SelectField, TextField } from '@/src/components/account/ui';
import { api, reportFailure, useApiData } from '@/src/lib/api';
import { formatRupiah } from '@/src/lib/format';
import type { Promo } from '@/src/lib/models';
import { cn } from '@/src/lib/utils';
import { promoSchema } from '@/src/lib/validation';
import type { PromoInput } from '@/src/lib/validation';

const emptyPromo: PromoInput = {
  code: '',
  type: 'percent',
  value: 10,
  minSubtotal: 0,
  maxDiscount: null,
  isActive: true,
};

function describeValue(promo: Promo): string {
  return promo.type === 'percent' ? `${promo.value}%` : formatRupiah(promo.value);
}

export default function AdminPromosPage() {
  const { data, error, loading, reload } = useApiData<{ promos: Promo[] }>('/admin/promos');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const form = useForm<PromoInput>({ resolver: zodResolver(promoSchema), defaultValues: emptyPromo });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const startEdit = (promo: Promo) => {
    const { id, ...values } = promo;

    setEditingId(id);
    setDeletingId(null);
    setFormError('');
    reset(values);
  };

  const stopEdit = () => {
    setEditingId(null);
    setFormError('');
    reset(emptyPromo);
  };

  const onSubmit = async (input: PromoInput) => {
    setFormError('');
    const result =
      editingId === null
        ? await api<{ promo: Promo }>('POST', '/admin/promos', input)
        : await api<{ promo: Promo }>('PUT', `/admin/promos/${editingId}`, input);

    if (!result.ok) {
      setNotice('');
      setFormError(reportFailure(result, form));
      return;
    }

    setNotice(`Kode promo ${result.data.promo.code} berhasil ${editingId === null ? 'ditambahkan' : 'diperbarui'}.`);
    stopEdit();
    reload();
  };

  const onDelete = async (promo: Promo) => {
    const result = await api('DELETE', `/admin/promos/${promo.id}`);
    setDeletingId(null);

    if (!result.ok) {
      setNotice('');
      setFormError(result.error);
      return;
    }

    if (editingId === promo.id) {
      stopEdit();
    }

    setNotice(`Kode promo ${promo.code} berhasil dihapus.`);
    reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-brand-ink">Kode Promo</h1>

      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {loading && <p className="text-sm text-brand-ink/60">Memuat kode promo...</p>}

      {data && data.promos.length === 0 && (
        <div data-testid="promos-empty" className="rounded-3xl border border-brand-beige bg-white p-10 text-center text-brand-ink/70">
          Belum ada kode promo.
        </div>
      )}

      {data && data.promos.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-brand-beige bg-white">
          <table className="w-full text-left text-sm" data-testid="promo-table">
            <thead className="border-b border-brand-beige text-brand-ink/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Kode</th>
                <th className="px-6 py-4 font-semibold">Potongan</th>
                <th className="px-6 py-4 font-semibold">Minimal subtotal</th>
                <th className="px-6 py-4 font-semibold">Maksimal diskon</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-beige">
              {data.promos.map((promo) => (
                <tr key={promo.id} data-testid={`promo-${promo.code}`}>
                  <td className="px-6 py-4 font-bold tracking-wide text-brand-ink">{promo.code}</td>
                  <td className="px-6 py-4">{describeValue(promo)}</td>
                  <td className="px-6 py-4">{formatRupiah(promo.minSubtotal)}</td>
                  <td className="px-6 py-4">{promo.maxDiscount === null ? '-' : formatRupiah(promo.maxDiscount)}</td>
                  <td className="px-6 py-4">
                    <span
                      data-testid="promo-status"
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                        promo.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700',
                      )}
                    >
                      {promo.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deletingId === promo.id ? (
                      <span className="flex items-center gap-3 text-red-700">
                        Hapus?
                        <button
                          type="button"
                          onClick={() => onDelete(promo)}
                          data-testid="confirm-yes"
                          className="font-semibold hover:underline"
                        >
                          Ya
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          data-testid="confirm-no"
                          className="font-semibold hover:underline"
                        >
                          Tidak
                        </button>
                      </span>
                    ) : (
                      <span className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => startEdit(promo)}
                          data-testid="edit-promo"
                          className="font-semibold text-brand-gold hover:underline"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(promo.id)}
                          data-testid="delete-promo"
                          className="font-semibold text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        data-testid="promo-form"
        className="space-y-5 rounded-3xl border border-brand-beige bg-white p-8"
      >
        <h2 className="text-lg font-serif font-bold text-brand-ink">
          {editingId === null ? 'Tambah Kode Promo' : 'Ubah Kode Promo'}
        </h2>
        {formError && <Alert tone="error">{formError}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Kode"
            placeholder="misal: HEMAT25"
            hint="4 sampai 15 karakter, huruf dan angka"
            error={errors.code?.message}
            {...register('code')}
          />
          <SelectField label="Jenis Potongan" error={errors.type?.message} {...register('type')}>
            <option value="percent">Persen dari subtotal</option>
            <option value="fixed">Potongan tetap (Rp)</option>
          </SelectField>
          <TextField
            label="Nilai"
            type="number"
            inputMode="numeric"
            hint="Persen 1 sampai 100, atau nominal rupiah"
            error={errors.value?.message}
            {...register('value', { valueAsNumber: true })}
          />
          <TextField
            label="Minimal Subtotal (Rp)"
            type="number"
            inputMode="numeric"
            error={errors.minSubtotal?.message}
            {...register('minSubtotal', { valueAsNumber: true })}
          />
          <TextField
            label="Maksimal Diskon (Rp, Opsional)"
            type="number"
            inputMode="numeric"
            hint="Hanya untuk promo persen. Kosongkan jika tanpa batas."
            error={errors.maxDiscount?.message}
            {...register('maxDiscount', {
              setValueAs: (value) => (value === '' || value === null ? null : Number(value)),
            })}
          />
          <label className="flex items-center gap-3 self-center text-sm font-semibold text-brand-ink/70">
            <input type="checkbox" className="h-4 w-4 accent-brand-gold" {...register('isActive')} />
            Promo aktif dan dapat dipakai pelanggan
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="promo-submit"
            className="btn-primary px-6 py-3 text-sm disabled:opacity-70"
          >
            {editingId === null ? 'Tambah Promo' : 'Simpan Perubahan'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={stopEdit} data-testid="promo-cancel" className="btn-secondary px-6 py-3 text-sm">
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
