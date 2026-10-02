import { describe, expect, test } from 'vitest';
import { calculateOrderTotal, calculateSubtotal, isPackageName } from '../src/lib/pricing';
import type { PromoRule } from '../src/lib/pricing';

// Kode promo yang sama dengan data awal di database.
const WEDLIFY10: PromoRule = { code: 'WEDLIFY10', type: 'percent', value: 10, minSubtotal: 300_000, maxDiscount: 75_000 };
const NIKAH50: PromoRule = { code: 'NIKAH50', type: 'fixed', value: 50_000, minSubtotal: 500_000, maxDiscount: null };

// WB-01 sampai WB-10 adalah test case hasil analisis manual statement dan branch
// coverage pada laporan White-Box Testing Modul 4.
describe('calculateOrderTotal: test case white-box', () => {
  test('WB-01: paket tidak dikenal ditolak pada field paket', () => {
    // Arrange
    const input = { packageName: 'Gold', extraPrintQty: 0, promoCode: '' };

    // Act
    const result = calculateOrderTotal(input, null);

    // Assert
    expect(result).toEqual({ ok: false, field: 'packageName', error: 'Pilih paket' });
  });

  test('WB-02: cetak tambahan di luar 0 sampai 500 ditolak', () => {
    // Arrange
    const input = { packageName: 'Premium', extraPrintQty: 501, promoCode: '' };

    // Act
    const result = calculateOrderTotal(input, null);

    // Assert
    expect(result).toEqual({
      ok: false,
      field: 'extraPrintQty',
      error: 'Cetak tambahan harus berupa bilangan bulat 0 sampai 500 lembar',
    });
  });

  test('WB-03: paket Basic dengan cetak tambahan ditolak', () => {
    // Arrange
    const input = { packageName: 'Basic', extraPrintQty: 1, promoCode: '' };

    // Act
    const result = calculateOrderTotal(input, null);

    // Assert
    expect(result).toEqual({
      ok: false,
      field: 'extraPrintQty',
      error: 'Paket Basic tidak menyediakan cetak tambahan. Pilih Standard atau Premium.',
    });
  });

  test('WB-04: tanpa kode promo, total sama dengan harga paket', () => {
    // Arrange
    const input = { packageName: 'Basic', extraPrintQty: 0, promoCode: '' };

    // Act
    const result = calculateOrderTotal(input, null);

    // Assert
    expect(result).toEqual({
      ok: true,
      packagePrice: 150_000,
      printCost: 0,
      subtotal: 150_000,
      discount: 0,
      total: 150_000,
      promoCode: '',
    });
  });

  test('WB-05: kode promo yang tidak ada di database ditolak', () => {
    // Arrange
    const input = { packageName: 'Standard', extraPrintQty: 0, promoCode: 'ABC' };

    // Act
    const result = calculateOrderTotal(input, null);

    // Assert
    expect(result).toEqual({ ok: false, field: 'promoCode', error: 'Kode promo tidak dikenal' });
  });

  test('WB-06: subtotal di bawah minimal promo ditolak', () => {
    // Arrange
    const input = { packageName: 'Basic', extraPrintQty: 0, promoCode: 'WEDLIFY10' };

    // Act
    const result = calculateOrderTotal(input, WEDLIFY10);

    // Assert
    expect(result).toEqual({
      ok: false,
      field: 'promoCode',
      error: 'Kode WEDLIFY10 berlaku untuk subtotal minimal Rp 300.000',
    });
  });

  test('WB-07: promo persen di bawah batas maksimal memotong 10 persen', () => {
    // Arrange
    const input = { packageName: 'Standard', extraPrintQty: 0, promoCode: 'WEDLIFY10' };

    // Act
    const result = calculateOrderTotal(input, WEDLIFY10);

    // Assert
    expect(result).toMatchObject({ ok: true, subtotal: 300_000, discount: 30_000, total: 270_000 });
  });

  test('WB-08: promo persen yang melewati batas dipotong menjadi Rp 75.000', () => {
    // Arrange
    const input = { packageName: 'Premium', extraPrintQty: 500, promoCode: 'WEDLIFY10' };

    // Act
    const result = calculateOrderTotal(input, WEDLIFY10);

    // Assert
    expect(result).toMatchObject({ ok: true, subtotal: 2_000_000, discount: 75_000, total: 1_925_000 });
  });

  test('WB-09: promo potongan tetap mengurangi Rp 50.000', () => {
    // Arrange
    const input = { packageName: 'Premium', extraPrintQty: 0, promoCode: 'NIKAH50' };

    // Act
    const result = calculateOrderTotal(input, NIKAH50);

    // Assert
    expect(result).toMatchObject({ ok: true, subtotal: 500_000, discount: 50_000, total: 450_000 });
  });

  test('WB-10: diskon tidak pernah melebihi subtotal', () => {
    // Arrange
    const hugePromo: PromoRule = { code: 'BIG', type: 'fixed', value: 999_999, minSubtotal: 0, maxDiscount: null };
    const input = { packageName: 'Basic', extraPrintQty: 0, promoCode: 'BIG' };

    // Act
    const result = calculateOrderTotal(input, hugePromo);

    // Assert
    expect(result).toMatchObject({ ok: true, discount: 150_000, total: 0 });
  });
});

describe('calculateOrderTotal: nilai batas dari black-box Modul 3', () => {
  test.each([
    [0, 300_000],
    [1, 303_000],
    [250, 1_050_000],
    [499, 1_797_000],
    [500, 1_800_000],
  ])('paket Standard dengan %i lembar cetak tambahan bernilai Rp %i', (extraPrintQty, expectedTotal) => {
    // Arrange
    const input = { packageName: 'Standard', extraPrintQty, promoCode: '' };

    // Act
    const result = calculateOrderTotal(input, null);

    // Assert
    expect(result).toMatchObject({ ok: true, total: expectedTotal });
  });

  test.each([-1, 501, 2.5, Number.NaN])('cetak tambahan %s ditolak', (extraPrintQty) => {
    // Arrange
    const input = { packageName: 'Standard', extraPrintQty };

    // Act
    const result = calculateSubtotal(input);

    // Assert
    expect(result).toMatchObject({ ok: false, field: 'extraPrintQty' });
  });

  test('WEDLIFY10 tepat di batas diskon Rp 75.000 tidak dipotong lagi', () => {
    // Arrange: Standard + 150 lembar = subtotal Rp 750.000, 10 persennya tepat Rp 75.000.
    const input = { packageName: 'Standard', extraPrintQty: 150, promoCode: 'WEDLIFY10' };

    // Act
    const result = calculateOrderTotal(input, WEDLIFY10);

    // Assert
    expect(result).toMatchObject({ ok: true, discount: 75_000, total: 675_000 });
  });

  test('kode promo ditulis huruf kecil dengan spasi tetap dikenali', () => {
    // Arrange
    const input = { packageName: 'Standard', extraPrintQty: 0, promoCode: ' wedlify10 ' };

    // Act
    const result = calculateOrderTotal(input, WEDLIFY10);

    // Assert
    expect(result).toMatchObject({ ok: true, promoCode: 'WEDLIFY10', total: 270_000 });
  });

  test('aturan promo untuk kode lain tidak dipakai', () => {
    // Arrange: kode yang diketik NIKAH50, tetapi aturan yang diberikan milik WEDLIFY10.
    const input = { packageName: 'Premium', extraPrintQty: 0, promoCode: 'NIKAH50' };

    // Act
    const result = calculateOrderTotal(input, WEDLIFY10);

    // Assert
    expect(result).toEqual({ ok: false, field: 'promoCode', error: 'Kode promo tidak dikenal' });
  });
});

describe('isPackageName', () => {
  test.each(['Basic', 'Standard', 'Premium'])('%s adalah paket yang dikenal', (name) => {
    expect(isPackageName(name)).toBe(true);
  });

  test.each(['', 'basic', 'Gold'])('"%s" bukan paket yang dikenal', (name) => {
    expect(isPackageName(name)).toBe(false);
  });
});
