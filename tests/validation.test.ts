import { describe, expect, test } from 'vitest';
import { addDays, formatDate, formatRupiah, toISODate } from '../src/lib/format';
import { createOrderSchema, createPaymentSchema, promoSchema, registerSchema } from '../src/lib/validation';

const TODAY = '2026-10-02';
const validOrder = {
  brideName: 'Sarah',
  groomName: 'James',
  weddingDate: '2026-11-01',
  location: 'Grand Ballroom, Hotel Mulia',
  templateName: 'Elegant Gold',
  packageName: 'Standard',
  guestCount: 300,
  extraPrintQty: 100,
  promoCode: '',
  designNotes: '',
};

function firstMessage(result: { success: boolean; error?: { issues: { message: string }[] } }): string {
  return result.success ? 'valid' : result.error!.issues[0].message;
}

describe('createOrderSchema: nilai batas', () => {
  const schema = createOrderSchema(TODAY);

  test.each([
    [9, 'Jumlah tamu minimal 10 orang'],
    [10, 'valid'],
    [2000, 'valid'],
    [2001, 'Jumlah tamu maksimal 2000 orang'],
    [10.5, 'Jumlah tamu harus bilangan bulat'],
    [Number.NaN, 'Jumlah tamu wajib diisi dengan angka'],
  ])('jumlah tamu %s menghasilkan "%s"', (guestCount, expected) => {
    // Act
    const result = schema.safeParse({ ...validOrder, guestCount });

    // Assert
    expect(firstMessage(result)).toBe(expected);
  });

  test.each([
    [addDays(TODAY, 6), 'Tanggal pernikahan minimal 7 hari dari hari ini'],
    [addDays(TODAY, 7), 'valid'],
    [addDays(TODAY, 730), 'valid'],
    [addDays(TODAY, 731), 'Tanggal pernikahan maksimal 2 tahun dari hari ini'],
    ['', 'Tanggal pernikahan wajib diisi'],
  ])('tanggal pernikahan %s menghasilkan "%s"', (weddingDate, expected) => {
    // Act
    const result = schema.safeParse({ ...validOrder, weddingDate });

    // Assert
    expect(firstMessage(result)).toBe(expected);
  });

  test.each([
    [{ brideName: 'S' }, 'Nama pengantin wanita minimal 2 karakter'],
    [{ groomName: 'a'.repeat(51) }, 'Nama pengantin pria maksimal 50 karakter'],
    [{ location: 'Solo' }, 'Lokasi minimal 5 karakter'],
    [{ templateName: '' }, 'Pilih tema undangan'],
    [{ packageName: '' }, 'Pilih paket'],
    [{ designNotes: 'x'.repeat(501) }, 'Catatan maksimal 500 karakter'],
    [{ packageName: 'Basic', extraPrintQty: 50 }, 'Paket Basic tidak menyediakan cetak tambahan. Pilih Standard atau Premium.'],
  ])('data %j menghasilkan "%s"', (override, expected) => {
    // Act
    const result = schema.safeParse({ ...validOrder, ...override });

    // Assert
    expect(firstMessage(result)).toBe(expected);
  });
});

describe('createPaymentSchema', () => {
  const schema = createPaymentSchema(450_000, TODAY, TODAY);
  const validPayment = { method: 'QRIS', senderName: 'Pelanggan Uji', amount: 450_000, paidAt: TODAY };

  test.each([
    [{}, 'valid'],
    [{ amount: 449_999 }, 'Nominal harus sama dengan total tagihan (Rp 450.000)'],
    [{ amount: 450_001 }, 'Nominal harus sama dengan total tagihan (Rp 450.000)'],
    [{ paidAt: addDays(TODAY, 1) }, 'Tanggal pembayaran tidak boleh melebihi hari ini'],
    [{ paidAt: addDays(TODAY, -1) }, 'Tanggal pembayaran tidak boleh sebelum tanggal pesanan'],
    [{ method: 'COD' }, 'Pilih metode pembayaran'],
    [{ senderName: 'Ab' }, 'Nama minimal 3 karakter'],
  ])('pembayaran %j menghasilkan "%s"', (override, expected) => {
    // Act
    const result = schema.safeParse({ ...validPayment, ...override });

    // Assert
    expect(firstMessage(result)).toBe(expected);
  });
});

describe('registerSchema', () => {
  const validAccount = {
    name: 'Pelanggan Uji',
    email: ' Pelanggan.Uji@Mail.com ',
    phone: '081234567890',
    password: 'Uji12345',
    confirmPassword: 'Uji12345',
  };

  test('email dirapikan menjadi huruf kecil tanpa spasi', () => {
    // Act
    const result = registerSchema.safeParse(validAccount);

    // Assert
    expect(result.success && result.data.email).toBe('pelanggan.uji@mail.com');
  });

  test.each([
    [{ name: 'Ab' }, 'Nama minimal 3 karakter'],
    [{ name: 'Bagas 123' }, 'Nama hanya boleh berisi huruf, spasi, titik, dan apostrof'],
    [{ email: 'bagas@' }, 'Format email tidak valid'],
    [{ phone: '081234567' }, 'Nomor WhatsApp harus diawali 08 dan terdiri dari 10 sampai 13 digit'],
    [{ phone: '08123456789012' }, 'Nomor WhatsApp harus diawali 08 dan terdiri dari 10 sampai 13 digit'],
    [{ password: 'abc1234', confirmPassword: 'abc1234' }, 'Password minimal 8 karakter'],
    [{ password: 'abcdefgh', confirmPassword: 'abcdefgh' }, 'Password harus mengandung huruf dan angka'],
    [{ confirmPassword: 'Uji12346' }, 'Konfirmasi password tidak sama'],
  ])('akun %j menghasilkan "%s"', (override, expected) => {
    // Act
    const result = registerSchema.safeParse({ ...validAccount, ...override });

    // Assert
    expect(firstMessage(result)).toBe(expected);
  });
});

describe('promoSchema', () => {
  const validPromo = { code: 'hemat25', type: 'percent', value: 25, minSubtotal: 150_000, maxDiscount: 100_000, isActive: true };

  test('kode disimpan dalam huruf besar', () => {
    // Act
    const result = promoSchema.safeParse(validPromo);

    // Assert
    expect(result.success && result.data.code).toBe('HEMAT25');
  });

  test.each([
    [{ code: 'ab' }, 'Kode promo 4 sampai 15 karakter, hanya huruf dan angka'],
    [{ value: 101 }, 'Persentase diskon maksimal 100'],
    [{ value: 0 }, 'Nilai promo minimal 1'],
    [{ type: 'fixed', value: 200_000, maxDiscount: null }, 'Minimal subtotal tidak boleh lebih kecil dari nilai potongan'],
    [{ type: 'fixed', value: 50_000 }, 'Maksimal diskon hanya berlaku untuk promo persen'],
  ])('promo %j menghasilkan "%s"', (override, expected) => {
    // Act
    const result = promoSchema.safeParse({ ...validPromo, ...override });

    // Assert
    expect(firstMessage(result)).toBe(expected);
  });
});

describe('format', () => {
  test('toISODate memakai tanggal WIB, bukan zona waktu mesin', () => {
    // Arrange: 16.59 UTC masih tanggal 2 di WIB, 17.00 UTC sudah tanggal 3.
    const beforeMidnight = new Date('2026-10-02T16:59:59Z');
    const atMidnight = new Date('2026-10-02T17:00:00Z');

    // Act dan Assert
    expect(toISODate(beforeMidnight)).toBe('2026-10-02');
    expect(toISODate(atMidnight)).toBe('2026-10-03');
  });

  test('addDays melewati pergantian bulan dan tahun', () => {
    expect(addDays('2026-10-28', 7)).toBe('2026-11-04');
    expect(addDays('2026-12-30', 7)).toBe('2027-01-06');
  });

  test('formatRupiah dan formatDate memakai format Indonesia', () => {
    expect(formatRupiah(1_500_000)).toBe('Rp 1.500.000');
    expect(formatDate('2026-10-09')).toBe('9 Oktober 2026');
  });
});
