import { formatRupiah } from './format';

export const PACKAGE_NAMES = ['Basic', 'Standard', 'Premium'] as const;
export type PackageName = (typeof PACKAGE_NAMES)[number];

interface PackageRule {
  price: number;
  includedPrint: number;
  allowsExtraPrint: boolean;
}

export const PACKAGES: Record<PackageName, PackageRule> = {
  Basic: { price: 150_000, includedPrint: 0, allowsExtraPrint: false },
  Standard: { price: 300_000, includedPrint: 50, allowsExtraPrint: true },
  Premium: { price: 500_000, includedPrint: 150, allowsExtraPrint: true },
};

export const EXTRA_PRINT_PRICE = 3_000;
export const MAX_EXTRA_PRINT = 500;

// Aturan satu kode promo. Datanya dikelola admin dan disimpan di tabel promos.
export interface PromoRule {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
}

export interface PriceInput {
  packageName: string;
  extraPrintQty: number;
  promoCode: string;
}

export interface PriceBreakdown {
  packagePrice: number;
  printCost: number;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string;
}

type PriceField = 'packageName' | 'extraPrintQty' | 'promoCode';
type PriceError = { ok: false; field: PriceField; error: string };

export type SubtotalResult = { ok: true; packagePrice: number; printCost: number; subtotal: number } | PriceError;
export type PriceResult = ({ ok: true } & PriceBreakdown) | PriceError;

export function isPackageName(value: string): value is PackageName {
  return (PACKAGE_NAMES as readonly string[]).includes(value);
}

export function calculateSubtotal({ packageName, extraPrintQty }: Omit<PriceInput, 'promoCode'>): SubtotalResult {
  if (!isPackageName(packageName)) {
    return { ok: false, field: 'packageName', error: 'Pilih paket' };
  }

  const selectedPackage = PACKAGES[packageName];

  if (!Number.isInteger(extraPrintQty) || extraPrintQty < 0 || extraPrintQty > MAX_EXTRA_PRINT) {
    return {
      ok: false,
      field: 'extraPrintQty',
      error: `Cetak tambahan harus berupa bilangan bulat 0 sampai ${MAX_EXTRA_PRINT} lembar`,
    };
  }

  if (extraPrintQty > 0 && !selectedPackage.allowsExtraPrint) {
    return {
      ok: false,
      field: 'extraPrintQty',
      error: `Paket ${packageName} tidak menyediakan cetak tambahan. Pilih Standard atau Premium.`,
    };
  }

  const printCost = extraPrintQty * EXTRA_PRINT_PRICE;

  return { ok: true, packagePrice: selectedPackage.price, printCost, subtotal: selectedPackage.price + printCost };
}

// `promo` adalah aturan promo aktif untuk kode yang diketik pelanggan,
// atau null jika kode tersebut tidak ada atau sedang nonaktif.
export function calculateOrderTotal(input: PriceInput, promo: PromoRule | null): PriceResult {
  const base = calculateSubtotal(input);

  if (!base.ok) {
    return base;
  }

  const { packagePrice, printCost, subtotal } = base;
  const code = input.promoCode.trim().toUpperCase();
  let discount = 0;

  if (code !== '') {
    if (promo === null || promo.code !== code) {
      return { ok: false, field: 'promoCode', error: 'Kode promo tidak dikenal' };
    }

    if (subtotal < promo.minSubtotal) {
      return {
        ok: false,
        field: 'promoCode',
        error: `Kode ${code} berlaku untuk subtotal minimal ${formatRupiah(promo.minSubtotal)}`,
      };
    }

    discount = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;

    if (promo.maxDiscount !== null && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }
  }

  return { ok: true, packagePrice, printCost, subtotal, discount, total: subtotal - discount, promoCode: code };
}
