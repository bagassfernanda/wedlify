import { describe, expect, test } from 'vitest';
import { canDelete, canEdit, canTransition, filterOrders } from '../src/lib/orderRules';
import type { OrderStatus } from '../src/lib/orderRules';

describe('canTransition: perpindahan status pesanan', () => {
  test.each([
    ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI', 'customer'],
    ['MENUNGGU_PEMBAYARAN', 'DIBATALKAN', 'customer'],
    ['MENUNGGU_VERIFIKASI', 'DIPROSES', 'admin'],
    ['MENUNGGU_VERIFIKASI', 'MENUNGGU_PEMBAYARAN', 'admin'],
    ['DIPROSES', 'SELESAI', 'admin'],
  ] as const)('%s ke %s oleh %s diizinkan', (from, to, role) => {
    // Act
    const allowed = canTransition(from, to, role);

    // Assert
    expect(allowed).toBe(true);
  });

  test.each([
    // Role yang salah untuk perpindahan yang sah.
    ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI', 'admin'],
    ['MENUNGGU_VERIFIKASI', 'DIPROSES', 'customer'],
    ['DIPROSES', 'SELESAI', 'customer'],
    // Perpindahan yang tidak ada dalam alur.
    ['MENUNGGU_VERIFIKASI', 'DIBATALKAN', 'customer'],
    ['DIPROSES', 'DIBATALKAN', 'customer'],
    ['SELESAI', 'DIPROSES', 'admin'],
    ['DIBATALKAN', 'MENUNGGU_PEMBAYARAN', 'customer'],
    ['MENUNGGU_PEMBAYARAN', 'SELESAI', 'admin'],
  ] as const)('%s ke %s oleh %s ditolak', (from, to, role) => {
    // Act
    const allowed = canTransition(from, to, role);

    // Assert
    expect(allowed).toBe(false);
  });
});

describe('canEdit dan canDelete', () => {
  const cases: [OrderStatus, boolean, boolean][] = [
    ['MENUNGGU_PEMBAYARAN', true, false],
    ['MENUNGGU_VERIFIKASI', false, false],
    ['DIPROSES', false, false],
    ['SELESAI', false, false],
    ['DIBATALKAN', false, true],
  ];

  test.each(cases)('status %s: boleh diubah %s, boleh dihapus %s', (status, editable, deletable) => {
    // Act dan Assert
    expect(canEdit(status)).toBe(editable);
    expect(canDelete(status)).toBe(deletable);
  });
});

describe('filterOrders', () => {
  const orders = [
    { id: 'WDL-0001', status: 'SELESAI' as const, brideName: 'Sarah', groomName: 'James', templateName: 'Elegant Gold' },
    { id: 'WDL-0002', status: 'MENUNGGU_PEMBAYARAN' as const, brideName: 'Dewi', groomName: 'Rama', templateName: 'Soft Floral' },
    {
      id: 'WDL-0003',
      status: 'MENUNGGU_PEMBAYARAN' as const,
      brideName: 'Putri',
      groomName: 'Bima',
      templateName: 'Soft Floral',
      customer: { name: 'Pelanggan Uji', email: 'pelanggan.uji@mail.com' },
    },
  ];

  test('tanpa kata kunci dan status SEMUA mengembalikan semua pesanan', () => {
    // Act
    const result = filterOrders(orders, { query: '', status: 'SEMUA' });

    // Assert
    expect(result).toHaveLength(3);
  });

  test('filter status hanya mengembalikan pesanan berstatus itu', () => {
    // Act
    const result = filterOrders(orders, { query: '', status: 'MENUNGGU_PEMBAYARAN' });

    // Assert
    expect(result.map((order) => order.id)).toEqual(['WDL-0002', 'WDL-0003']);
  });

  test.each([
    [' wdl-0001 ', ['WDL-0001']],
    ['dewi', ['WDL-0002']],
    ['BIMA', ['WDL-0003']],
    ['soft floral', ['WDL-0002', 'WDL-0003']],
    ['pelanggan.uji@', ['WDL-0003']],
    ['tidak ada', []],
  ])('kata kunci "%s" mencocokkan %j', (query, expectedIds) => {
    // Act
    const result = filterOrders(orders, { query, status: 'SEMUA' });

    // Assert
    expect(result.map((order) => order.id)).toEqual(expectedIds);
  });

  test('kata kunci dan status digabungkan', () => {
    // Act
    const result = filterOrders(orders, { query: 'soft', status: 'SELESAI' });

    // Assert
    expect(result).toEqual([]);
  });
});
