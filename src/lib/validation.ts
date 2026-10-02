import * as z from 'zod';
import { addDays, formatRupiah } from './format';
import { MAX_EXTRA_PRINT, PACKAGE_NAMES, calculateSubtotal } from './pricing';

// Aturan validasi dipakai bersama oleh form di browser dan oleh server.
export const NAME_MIN = 3;
export const NAME_MAX = 50;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
export const COUPLE_NAME_MIN = 2;
export const COUPLE_NAME_MAX = 50;
export const LOCATION_MIN = 5;
export const LOCATION_MAX = 100;
export const GUEST_MIN = 10;
export const GUEST_MAX = 2000;
export const NOTES_MAX = 500;
export const WEDDING_MIN_DAYS = 7;
export const WEDDING_MAX_DAYS = 730;
export const REJECT_REASON_MIN = 5;
export const REJECT_REASON_MAX = 200;
export const PAYMENT_METHODS = ['Transfer Bank', 'QRIS', 'E-Wallet'] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const nameField = z
  .string()
  .trim()
  .min(NAME_MIN, `Nama minimal ${NAME_MIN} karakter`)
  .max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`)
  .regex(/^[A-Za-z\s.']+$/, 'Nama hanya boleh berisi huruf, spasi, titik, dan apostrof');

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email wajib diisi')
  .max(100, 'Email maksimal 100 karakter')
  .email('Format email tidak valid');

const phoneField = z
  .string()
  .trim()
  .regex(/^08\d{8,11}$/, 'Nomor WhatsApp harus diawali 08 dan terdiri dari 10 sampai 13 digit');

const passwordField = z
  .string()
  .min(PASSWORD_MIN, `Password minimal ${PASSWORD_MIN} karakter`)
  .max(PASSWORD_MAX, `Password maksimal ${PASSWORD_MAX} karakter`)
  .regex(/[A-Za-z]/, 'Password harus mengandung huruf dan angka')
  .regex(/\d/, 'Password harus mengandung huruf dan angka');

const confirmMismatch = { path: ['confirmPassword'], message: 'Konfirmasi password tidak sama' };

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, confirmMismatch);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password wajib diisi'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/, 'Kode reset terdiri dari 6 digit angka'),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, confirmMismatch);

export const profileSchema = z.object({
  name: nameField,
  phone: phoneField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, confirmMismatch)
  .refine((data) => data.password !== data.currentPassword, {
    path: ['password'],
    message: 'Password baru tidak boleh sama dengan password saat ini',
  });

function coupleNameField(label: string) {
  return z
    .string()
    .trim()
    .min(COUPLE_NAME_MIN, `${label} minimal ${COUPLE_NAME_MIN} karakter`)
    .max(COUPLE_NAME_MAX, `${label} maksimal ${COUPLE_NAME_MAX} karakter`);
}

const extraPrintField = z
  .number({ error: 'Cetak tambahan wajib diisi dengan angka, isi 0 jika tidak perlu' })
  .int('Cetak tambahan harus bilangan bulat')
  .min(0, 'Cetak tambahan tidak boleh negatif')
  .max(MAX_EXTRA_PRINT, `Cetak tambahan maksimal ${MAX_EXTRA_PRINT} lembar`);

const promoCodeField = z.string().trim().max(20, 'Kode promo maksimal 20 karakter');

// Batas tanggal bergantung pada hari ini, sehingga skema dibuat per tanggal.
// Kode promo diperiksa server karena daftar promo ada di database.
export function createOrderSchema(today: string) {
  const minDate = addDays(today, WEDDING_MIN_DAYS);
  const maxDate = addDays(today, WEDDING_MAX_DAYS);

  return z
    .object({
      brideName: coupleNameField('Nama pengantin wanita'),
      groomName: coupleNameField('Nama pengantin pria'),
      weddingDate: z
        .string()
        .min(1, 'Tanggal pernikahan wajib diisi')
        .regex(ISO_DATE, 'Format tanggal tidak valid')
        .refine((value) => value >= minDate, `Tanggal pernikahan minimal ${WEDDING_MIN_DAYS} hari dari hari ini`)
        .refine((value) => value <= maxDate, 'Tanggal pernikahan maksimal 2 tahun dari hari ini'),
      location: z
        .string()
        .trim()
        .min(LOCATION_MIN, `Lokasi minimal ${LOCATION_MIN} karakter`)
        .max(LOCATION_MAX, `Lokasi maksimal ${LOCATION_MAX} karakter`),
      templateName: z.string().trim().min(1, 'Pilih tema undangan').max(60, 'Nama tema maksimal 60 karakter'),
      packageName: z
        .string()
        .refine((value) => (PACKAGE_NAMES as readonly string[]).includes(value), 'Pilih paket'),
      guestCount: z
        .number({ error: 'Jumlah tamu wajib diisi dengan angka' })
        .int('Jumlah tamu harus bilangan bulat')
        .min(GUEST_MIN, `Jumlah tamu minimal ${GUEST_MIN} orang`)
        .max(GUEST_MAX, `Jumlah tamu maksimal ${GUEST_MAX} orang`),
      extraPrintQty: extraPrintField,
      promoCode: promoCodeField,
      designNotes: z.string().trim().max(NOTES_MAX, `Catatan maksimal ${NOTES_MAX} karakter`),
    })
    .superRefine((data, ctx) => {
      const subtotal = calculateSubtotal(data);

      if (!subtotal.ok) {
        ctx.addIssue({ code: 'custom', path: [subtotal.field], message: subtotal.error });
      }
    });
}

export const quoteSchema = z.object({
  packageName: z.string(),
  extraPrintQty: extraPrintField,
  promoCode: promoCodeField,
});

export function createPaymentSchema(total: number, today: string, orderDate: string) {
  return z.object({
    method: z
      .string()
      .refine((value) => (PAYMENT_METHODS as readonly string[]).includes(value), 'Pilih metode pembayaran'),
    senderName: nameField,
    amount: z
      .number({ error: 'Nominal wajib diisi dengan angka' })
      .int('Nominal harus bilangan bulat')
      .refine((value) => value === total, `Nominal harus sama dengan total tagihan (${formatRupiah(total)})`),
    paidAt: z
      .string()
      .min(1, 'Tanggal pembayaran wajib diisi')
      .regex(ISO_DATE, 'Format tanggal tidak valid')
      .refine((value) => value <= today, 'Tanggal pembayaran tidak boleh melebihi hari ini')
      .refine((value) => value >= orderDate, 'Tanggal pembayaran tidak boleh sebelum tanggal pesanan'),
  });
}

export const rejectPaymentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(REJECT_REASON_MIN, `Alasan penolakan minimal ${REJECT_REASON_MIN} karakter`)
    .max(REJECT_REASON_MAX, `Alasan penolakan maksimal ${REJECT_REASON_MAX} karakter`),
});

export const customerStatusSchema = z.object({
  isActive: z.boolean({ error: 'Status akun wajib diisi' }),
});

export const promoSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{4,15}$/, 'Kode promo 4 sampai 15 karakter, hanya huruf dan angka'),
    type: z.enum(['percent', 'fixed'], { error: 'Pilih jenis promo' }),
    value: z
      .number({ error: 'Nilai promo wajib diisi dengan angka' })
      .int('Nilai promo harus bilangan bulat')
      .min(1, 'Nilai promo minimal 1'),
    minSubtotal: z
      .number({ error: 'Minimal subtotal wajib diisi dengan angka' })
      .int('Minimal subtotal harus bilangan bulat')
      .min(0, 'Minimal subtotal tidak boleh negatif'),
    maxDiscount: z
      .number({ error: 'Maksimal diskon harus berupa angka' })
      .int('Maksimal diskon harus bilangan bulat')
      .min(1, 'Maksimal diskon minimal 1')
      .nullable(),
    isActive: z.boolean({ error: 'Status promo wajib diisi' }),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'percent' && data.value > 100) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Persentase diskon maksimal 100' });
    }

    if (data.type === 'fixed' && data.value > data.minSubtotal) {
      ctx.addIssue({
        code: 'custom',
        path: ['minSubtotal'],
        message: 'Minimal subtotal tidak boleh lebih kecil dari nilai potongan',
      });
    }

    if (data.type === 'fixed' && data.maxDiscount !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxDiscount'],
        message: 'Maksimal diskon hanya berlaku untuk promo persen',
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type OrderInput = z.infer<ReturnType<typeof createOrderSchema>>;
export type PaymentInput = z.infer<ReturnType<typeof createPaymentSchema>>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
export type PromoInput = z.infer<typeof promoSchema>;
