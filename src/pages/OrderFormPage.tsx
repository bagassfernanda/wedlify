import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, SelectField, TextAreaField, TextField } from '@/src/components/account/ui';
import { templateNames } from '@/src/components/TemplateCatalog';
import { api, reportFailure, useApiData } from '@/src/lib/api';
import { formatRupiah, toISODate } from '@/src/lib/format';
import type { Order } from '@/src/lib/models';
import { canEdit } from '@/src/lib/orderRules';
import { EXTRA_PRINT_PRICE, MAX_EXTRA_PRINT, PACKAGES, PACKAGE_NAMES, isPackageName } from '@/src/lib/pricing';
import type { PriceBreakdown } from '@/src/lib/pricing';
import { navigate } from '@/src/lib/router';
import { GUEST_MAX, GUEST_MIN, NOTES_MAX, WEDDING_MIN_DAYS, createOrderSchema } from '@/src/lib/validation';
import type { OrderInput } from '@/src/lib/validation';

const CUSTOM_TEMPLATE = 'Custom (sesuai catatan desain)';
const templateOptions = [...templateNames, CUSTOM_TEMPLATE];
const QUOTE_DELAY_MS = 300;

export interface OrderPreset {
  templateName: string;
  packageName: string;
}

interface Quote {
  price: PriceBreakdown | null;
  message: string;
}

interface OrderEditorProps {
  existing: Order | null;
  preset: OrderPreset;
}

function OrderEditor({ existing, preset }: OrderEditorProps) {
  const [formError, setFormError] = useState('');
  const [quote, setQuote] = useState<Quote>({ price: null, message: '' });
  const schema = useMemo(() => createOrderSchema(toISODate(new Date())), []);

  const form = useForm<OrderInput>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          brideName: existing.brideName,
          groomName: existing.groomName,
          weddingDate: existing.weddingDate,
          location: existing.location,
          templateName: existing.templateName,
          packageName: existing.packageName,
          guestCount: existing.guestCount,
          extraPrintQty: existing.extraPrintQty,
          promoCode: existing.promoCode,
          designNotes: existing.designNotes,
        }
      : {
          brideName: '',
          groomName: '',
          weddingDate: '',
          location: '',
          templateName: templateOptions.includes(preset.templateName) ? preset.templateName : '',
          packageName: isPackageName(preset.packageName) ? preset.packageName : '',
          guestCount: 100,
          extraPrintQty: 0,
          promoCode: '',
          designNotes: '',
        },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const [packageName, extraPrintQty, promoCode] = watch(['packageName', 'extraPrintQty', 'promoCode']);

  // Rincian harga dihitung server karena daftar kode promo ada di database.
  useEffect(() => {
    if (packageName === '') {
      setQuote({ price: null, message: 'Pilih paket untuk melihat rincian harga.' });
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      const result = await api<{ price: PriceBreakdown | null; error?: string }>('POST', '/orders/quote', {
        packageName,
        extraPrintQty,
        promoCode,
      });

      if (!active) {
        return;
      }

      setQuote(
        result.ok
          ? { price: result.data.price, message: result.data.error ?? '' }
          : { price: null, message: result.error },
      );
    }, QUOTE_DELAY_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [packageName, extraPrintQty, promoCode]);

  const onSubmit = async (data: OrderInput) => {
    setFormError('');
    const result = existing
      ? await api<{ order: Order }>('PUT', `/orders/${existing.id}`, data)
      : await api<{ order: Order }>('POST', '/orders', data);

    if (!result.ok) {
      setFormError(reportFailure(result, form));
      return;
    }

    navigate(`/orders/${result.data.order.id}?info=${existing ? 'updated' : 'created'}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <a
          href={existing ? `#/orders/${existing.id}` : '#/orders'}
          className="text-sm font-semibold text-brand-ink/50 hover:text-brand-gold"
        >
          Kembali
        </a>
        <h1 className="mt-2 text-3xl font-serif font-bold text-brand-ink">
          {existing ? `Ubah Pesanan ${existing.id}` : 'Buat Pesanan'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-3xl border border-brand-beige bg-white p-8">
          {formError && <Alert tone="error">{formError}</Alert>}

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label="Nama Pengantin Wanita"
              placeholder="misal: Sarah"
              error={errors.brideName?.message}
              {...register('brideName')}
            />
            <TextField
              label="Nama Pengantin Pria"
              placeholder="misal: James"
              error={errors.groomName?.message}
              {...register('groomName')}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label="Tanggal Pernikahan"
              type="date"
              hint={`Minimal ${WEDDING_MIN_DAYS} hari dari hari ini`}
              error={errors.weddingDate?.message}
              {...register('weddingDate')}
            />
            <TextField
              label="Jumlah Tamu"
              type="number"
              inputMode="numeric"
              hint={`${GUEST_MIN} sampai ${GUEST_MAX} orang`}
              error={errors.guestCount?.message}
              {...register('guestCount', { valueAsNumber: true })}
            />
          </div>

          <TextField
            label="Lokasi"
            placeholder="misal: Grand Ballroom, Hotel Mulia"
            error={errors.location?.message}
            {...register('location')}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField label="Tema Undangan" error={errors.templateName?.message} {...register('templateName')}>
              <option value="">Pilih tema</option>
              {templateOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Paket" error={errors.packageName?.message} {...register('packageName')}>
              <option value="">Pilih paket</option>
              {PACKAGE_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name} ({formatRupiah(PACKAGES[name].price)})
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label="Cetak Tambahan (lembar)"
              type="number"
              inputMode="numeric"
              hint={`0 sampai ${MAX_EXTRA_PRINT} lembar, ${formatRupiah(EXTRA_PRINT_PRICE)} per lembar. Hanya paket Standard dan Premium.`}
              error={errors.extraPrintQty?.message}
              {...register('extraPrintQty', { valueAsNumber: true })}
            />
            <TextField
              label="Kode Promo (Opsional)"
              placeholder="misal: WEDLIFY10"
              error={errors.promoCode?.message}
              {...register('promoCode')}
            />
          </div>

          <TextAreaField
            label="Catatan Desain (Opsional)"
            rows={4}
            placeholder="Contoh: nuansa cream dan gold, banyak foto, atau link referensi"
            hint={`Maksimal ${NOTES_MAX} karakter`}
            error={errors.designNotes?.message}
            {...register('designNotes')}
          />
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-brand-beige bg-white p-8" data-testid="price-summary">
          <h2 className="text-lg font-serif font-bold text-brand-ink">Rincian Harga</h2>

          {quote.price ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/60">Paket {packageName}</dt>
                <dd className="font-semibold">{formatRupiah(quote.price.packagePrice)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/60">Cetak tambahan</dt>
                <dd className="font-semibold">{formatRupiah(quote.price.printCost)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/60">Diskon {quote.price.promoCode}</dt>
                <dd className="font-semibold">- {formatRupiah(quote.price.discount)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-brand-beige pt-3 text-base">
                <dt className="font-bold text-brand-ink">Total</dt>
                <dd className="font-bold text-brand-gold" data-testid="price-total">
                  {formatRupiah(quote.price.total)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-brand-ink/60" data-testid="price-unavailable">
              {quote.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="order-submit"
            className="w-full btn-primary py-4 disabled:opacity-70"
          >
            {existing ? 'Simpan Perubahan' : 'Buat Pesanan'}
          </button>
        </aside>
      </form>
    </div>
  );
}

function ExistingOrderEditor({ orderId, preset }: { orderId: string; preset: OrderPreset }) {
  const { data, error, loading } = useApiData<{ order: Order }>(`/orders/${orderId}`);

  if (loading) {
    return <p className="text-sm text-brand-ink/60">Memuat pesanan...</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{error}</Alert>
        <a href="#/orders" className="font-semibold text-brand-gold hover:underline">
          Kembali ke Pesanan Saya
        </a>
      </div>
    );
  }

  if (!canEdit(data.order.status)) {
    return (
      <div className="space-y-4">
        <Alert tone="error">Pesanan hanya dapat diubah saat berstatus Menunggu Pembayaran.</Alert>
        <a href={`#/orders/${data.order.id}`} className="font-semibold text-brand-gold hover:underline">
          Kembali ke detail pesanan
        </a>
      </div>
    );
  }

  return <OrderEditor existing={data.order} preset={preset} />;
}

interface OrderFormPageProps {
  orderId?: string;
  preset: OrderPreset;
}

export default function OrderFormPage({ orderId, preset }: OrderFormPageProps) {
  return orderId ? (
    <ExistingOrderEditor orderId={orderId} preset={preset} />
  ) : (
    <OrderEditor existing={null} preset={preset} />
  );
}
