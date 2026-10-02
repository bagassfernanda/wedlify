import { describe, expect, test, vi } from 'vitest';
import { openDatabase } from '../server/db';
import type { Db } from '../server/db';
import * as admin from '../server/services/admin';
import * as auth from '../server/services/auth';
import * as orders from '../server/services/orders';

// Layanan server bergantung pada database. Pada unit test, database produksi
// (Turso) diganti dengan test double supaya tiap unit bisa diuji terpisah.

// Pukul 10.00 WIB, ditulis dalam UTC supaya tidak bergantung zona waktu mesin.
const NOW = new Date('2026-10-02T03:00:00Z');
const minutesLater = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);

const account = {
  name: 'Pelanggan Uji',
  email: 'pelanggan.uji@mail.com',
  phone: '081234567890',
  password: 'Uji12345',
  confirmPassword: 'Uji12345',
};
const order = {
  brideName: 'Sarah',
  groomName: 'James',
  weddingDate: '2026-11-01',
  location: 'Grand Ballroom, Hotel Mulia',
  templateName: 'Elegant Gold',
  packageName: 'Standard',
  guestCount: 300,
  extraPrintQty: 100,
  promoCode: 'WEDLIFY10',
  designNotes: '',
};
const payment = { method: 'QRIS', senderName: 'Pelanggan Uji', amount: 540_000, paidAt: '2026-10-02' };

// Fake: SQLite di memori, dengan tabel dan data awal yang sama dengan produksi.
const createFakeDb = () => openDatabase({ file: ':memory:' });

// Stub: database yang selalu mengembalikan baris yang sudah ditentukan.
function createDbStub(row: unknown): Db {
  return {
    one: async <T>() => row as T | undefined,
    all: async <T>() => (row === undefined ? [] : [row]) as T[],
    run: async () => ({ changes: 0, lastId: 0 }),
    script: async () => {},
  };
}

// Mock: database tiruan yang mencatat setiap pemanggilan.
function createDbMock(existingRow?: unknown) {
  const one = vi.fn().mockResolvedValue(existingRow);
  const all = vi.fn().mockResolvedValue([]);
  const run = vi.fn().mockResolvedValue({ changes: 1, lastId: 1 });
  const script = vi.fn().mockResolvedValue(undefined);
  return { db: { one, all, run, script } as unknown as Db, one, run };
}

describe('Dummy: database wajib diisi tetapi tidak dipakai', () => {
  test('getSessionUser mengembalikan null untuk token kosong', async () => {
    // Arrange
    const dummyDb = {} as Db;

    // Act
    const user = await auth.getSessionUser(dummyDb, null);

    // Assert
    expect(user).toBeNull();
  });

  test('createOrder menolak data tidak valid sebelum menyentuh database', async () => {
    // Arrange
    const dummyDb = {} as Db;

    // Act
    const attempt = orders.createOrder(dummyDb, 1, { ...order, guestCount: 9 }, NOW);

    // Assert
    await expect(attempt).rejects.toMatchObject({ status: 422, field: 'guestCount', message: 'Jumlah tamu minimal 10 orang' });
  });
});

describe('Stub: database mengembalikan jawaban yang sudah ditentukan', () => {
  test('quoteOrder menghitung diskon dari baris promo yang dikembalikan stub', async () => {
    // Arrange
    const promoStub = createDbStub({ code: 'WEDLIFY10', type: 'percent', value: 10, min_subtotal: 300_000, max_discount: 75_000 });

    // Act
    const price = await orders.quoteOrder(promoStub, { packageName: 'Standard', extraPrintQty: 100, promoCode: 'WEDLIFY10' });

    // Assert
    expect(price).toEqual({ packagePrice: 300_000, printCost: 300_000, subtotal: 600_000, discount: 60_000, total: 540_000, promoCode: 'WEDLIFY10' });
  });

  test('quoteOrder menolak kode promo saat stub tidak menemukan baris', async () => {
    // Arrange
    const emptyStub = createDbStub(undefined);

    // Act
    const attempt = orders.quoteOrder(emptyStub, { packageName: 'Standard', extraPrintQty: 0, promoCode: 'ABC' });

    // Assert
    await expect(attempt).rejects.toMatchObject({ status: 422, field: 'promoCode', message: 'Kode promo tidak dikenal' });
  });

  test('getSessionUser tidak pernah mengembalikan hash password', async () => {
    // Arrange
    const userStub = createDbStub({
      id: 7,
      name: 'Pelanggan Uji',
      email: 'pelanggan.uji@mail.com',
      phone: '081234567890',
      password_hash: 'salt:hash',
      role: 'customer',
      is_active: 1,
    });

    // Act
    const user = await auth.getSessionUser(userStub, 'token-apa-saja', NOW);

    // Assert
    expect(user).toEqual({ id: 7, name: 'Pelanggan Uji', email: 'pelanggan.uji@mail.com', phone: '081234567890', role: 'customer' });
  });
});

describe('Mock: memeriksa perintah yang dikirim ke database', () => {
  test('logout menghapus sesi dengan token yang diberikan', async () => {
    // Arrange
    const { db, run } = createDbMock();

    // Act
    await auth.logout(db, 'token-abc');

    // Assert
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith('DELETE FROM sessions WHERE token = ?', ['token-abc']);
  });

  test('logout tanpa token tidak mengirim perintah apa pun', async () => {
    // Arrange
    const { db, run } = createDbMock();

    // Act
    await auth.logout(db, null);

    // Assert
    expect(run).not.toHaveBeenCalled();
  });

  test('registerCustomer tidak menyimpan akun bila email sudah terdaftar', async () => {
    // Arrange: pencarian email mengembalikan akun yang sudah ada.
    const { db, one, run } = createDbMock({ id: 3, email: account.email });

    // Act
    const attempt = auth.registerCustomer(db, account, NOW);

    // Assert
    await expect(attempt).rejects.toMatchObject({ status: 409, field: 'email' });
    expect(one).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', [account.email]);
    expect(run).not.toHaveBeenCalled();
  });
});

describe('Fake: SQLite di memori menggantikan database produksi', () => {
  test('akun yang didaftarkan dapat login dan sesinya dikenali', async () => {
    // Arrange
    const db = await createFakeDb();
    await auth.registerCustomer(db, account, NOW);

    // Act
    const { user, token } = await auth.login(db, { email: account.email, password: account.password }, NOW);

    // Assert
    expect(user).toMatchObject({ email: account.email, role: 'customer' });
    expect(await auth.getSessionUser(db, token, NOW)).toMatchObject({ id: user.id });
  });

  test('akun admin bawaan dapat login dengan admin123', async () => {
    // Arrange
    const db = await createFakeDb();

    // Act
    const { user } = await auth.login(db, { email: 'admin@gmail.com', password: 'admin123' }, NOW);

    // Assert
    expect(user.role).toBe('admin');
  });

  test('akun terkunci setelah 5 kali gagal dan terbuka tepat setelah 5 menit', async () => {
    // Arrange
    const db = await createFakeDb();
    await auth.registerCustomer(db, account, NOW);
    const wrong = { email: account.email, password: 'Salah12345' };
    const right = { email: account.email, password: account.password };

    // Act
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await expect(auth.login(db, wrong, NOW)).rejects.toMatchObject({
        status: 401,
        message: `Email atau password salah. Sisa percobaan: ${5 - attempt}.`,
      });
    }
    const fifth = auth.login(db, wrong, NOW);

    // Assert
    await expect(fifth).rejects.toMatchObject({ status: 423, message: 'Akun dikunci selama 5 menit karena 5 kali gagal masuk.' });
    await expect(auth.login(db, right, minutesLater(4.99))).rejects.toMatchObject({ status: 423 });
    await expect(auth.login(db, right, minutesLater(5))).resolves.toMatchObject({ user: { email: account.email } });
  });

  test('kode reset hangus setelah 3 kali salah dan kedaluwarsa setelah 10 menit', async () => {
    // Arrange
    const db = await createFakeDb();
    await auth.registerCustomer(db, account, NOW);
    const reset = (code: string, when: Date) =>
      auth.resetPassword(db, { email: account.email, code, password: 'Baru12345', confirmPassword: 'Baru12345' }, when);

    // Act dan Assert: tiga kali salah
    const first = await auth.requestPasswordReset(db, { email: account.email }, NOW);
    const wrongCode = first.code === '000000' ? '111111' : '000000';
    await expect(reset(wrongCode, NOW)).rejects.toMatchObject({ message: 'Kode reset salah. Sisa percobaan: 2.' });
    await expect(reset(wrongCode, NOW)).rejects.toMatchObject({ message: 'Kode reset salah. Sisa percobaan: 1.' });
    await expect(reset(wrongCode, NOW)).rejects.toMatchObject({ message: 'Kode reset salah 3 kali. Minta kode baru.' });
    await expect(reset(first.code, NOW)).rejects.toMatchObject({ message: 'Minta kode reset terlebih dahulu.' });

    // Act dan Assert: kedaluwarsa, lalu berhasil dengan kode baru
    const second = await auth.requestPasswordReset(db, { email: account.email }, NOW);
    await expect(reset(second.code, new Date(NOW.getTime() + 600_001))).rejects.toMatchObject({ status: 410 });
    const third = await auth.requestPasswordReset(db, { email: account.email }, NOW);
    await expect(reset(third.code, minutesLater(10))).resolves.toBeUndefined();
    await expect(auth.login(db, { email: account.email, password: 'Baru12345' }, NOW)).resolves.toBeDefined();
  });

  test('pesanan tersimpan dengan harga yang dihitung dari promo di database', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);

    // Act
    const created = await orders.createOrder(db, user.id, order, NOW);

    // Assert
    expect(created).toMatchObject({
      id: 'WDL-0001',
      status: 'MENUNGGU_PEMBAYARAN',
      promoCode: 'WEDLIFY10',
      price: { packagePrice: 300_000, printCost: 300_000, subtotal: 600_000, discount: 60_000, total: 540_000 },
    });
  });

  test('pesanan keempat yang belum dibayar ditolak', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);
    for (let count = 0; count < 3; count += 1) {
      await orders.createOrder(db, user.id, order, NOW);
    }

    // Act
    const fourth = orders.createOrder(db, user.id, order, NOW);

    // Assert
    await expect(fourth).rejects.toMatchObject({ status: 409 });
  });

  test('User tidak dapat membuka atau membatalkan pesanan milik User lain', async () => {
    // Arrange
    const db = await createFakeDb();
    const owner = await auth.registerCustomer(db, account, NOW);
    const other = await auth.registerCustomer(db, { ...account, email: 'pelanggan.dua@mail.com' }, NOW);
    await orders.createOrder(db, owner.id, order, NOW);

    // Act dan Assert
    await expect(orders.getOrder(db, other.id, 'WDL-0001')).rejects.toMatchObject({ status: 404 });
    await expect(orders.cancelOrder(db, other.id, 'WDL-0001', NOW)).rejects.toMatchObject({ status: 404 });
  });

  test('setelah pembayaran dikonfirmasi, pesanan tidak dapat diubah, dibatalkan, atau dihapus', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);
    await orders.createOrder(db, user.id, order, NOW);

    // Act
    const paid = await orders.confirmPayment(db, user.id, 'WDL-0001', payment, NOW);

    // Assert
    expect(paid.status).toBe('MENUNGGU_VERIFIKASI');
    await expect(orders.updateOrder(db, user.id, 'WDL-0001', order, NOW)).rejects.toMatchObject({ status: 409 });
    await expect(orders.cancelOrder(db, user.id, 'WDL-0001', NOW)).rejects.toMatchObject({ status: 409 });
    await expect(orders.deleteOrder(db, user.id, 'WDL-0001')).rejects.toMatchObject({ status: 409 });
  });

  test('nominal pembayaran harus sama persis dengan total', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);
    await orders.createOrder(db, user.id, order, NOW);

    // Act
    const tooLittle = orders.confirmPayment(db, user.id, 'WDL-0001', { ...payment, amount: 539_999 }, NOW);

    // Assert
    await expect(tooLittle).rejects.toMatchObject({ status: 422, field: 'amount' });
  });

  test('pembayaran yang ditolak admin dapat dikonfirmasi ulang lalu diproses sampai selesai', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);
    await orders.createOrder(db, user.id, order, NOW);
    await orders.confirmPayment(db, user.id, 'WDL-0001', payment, NOW);

    // Act
    const rejected = await admin.rejectPayment(db, 'WDL-0001', { reason: 'Nominal tidak ditemukan di mutasi' }, NOW);
    const repaid = await orders.confirmPayment(db, user.id, 'WDL-0001', payment, NOW);
    const approved = await admin.approvePayment(db, 'WDL-0001', NOW);
    const completed = await admin.completeOrder(db, 'WDL-0001', NOW);

    // Assert
    expect(rejected).toMatchObject({ status: 'MENUNGGU_PEMBAYARAN', rejectReason: 'Nominal tidak ditemukan di mutasi', payment: null });
    expect(repaid).toMatchObject({ status: 'MENUNGGU_VERIFIKASI', rejectReason: '' });
    expect(approved.status).toBe('DIPROSES');
    expect(completed.status).toBe('SELESAI');
    expect((await admin.getSummary(db)).revenue).toBe(540_000);
  });

  test('pesanan yang dibatalkan dapat dihapus dan nomornya tidak dipakai ulang', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);
    await orders.createOrder(db, user.id, order, NOW);

    // Act
    const cancelled = await orders.cancelOrder(db, user.id, 'WDL-0001', NOW);
    await orders.deleteOrder(db, user.id, 'WDL-0001');
    const next = await orders.createOrder(db, user.id, order, NOW);

    // Assert
    expect(cancelled.status).toBe('DIBATALKAN');
    expect(next.id).toBe('WDL-0002');
    expect(await orders.listOrders(db, user.id)).toHaveLength(1);
  });

  test('promo yang dinonaktifkan admin tidak dapat dipakai User', async () => {
    // Arrange
    const db = await createFakeDb();
    const promo = await admin.createPromo(db, { code: 'hemat25', type: 'percent', value: 25, minSubtotal: 0, maxDiscount: null, isActive: true }, NOW);
    const quote = () => orders.quoteOrder(db, { packageName: 'Basic', extraPrintQty: 0, promoCode: 'HEMAT25' });
    await expect(quote()).resolves.toMatchObject({ total: 112_500 });

    // Act
    await admin.updatePromo(db, promo.id, { code: 'HEMAT25', type: 'percent', value: 25, minSubtotal: 0, maxDiscount: null, isActive: false });

    // Assert
    await expect(quote()).rejects.toMatchObject({ status: 422, message: 'Kode promo tidak dikenal' });
    await expect(admin.createPromo(db, { code: 'WEDLIFY10', type: 'percent', value: 5, minSubtotal: 0, maxDiscount: null, isActive: true }, NOW)).rejects.toMatchObject({ status: 409 });
  });
});

describe('Spy: mengamati database asli (fake) tanpa mengubah perilakunya', () => {
  test('menonaktifkan pelanggan menghapus sesinya', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);
    const { token } = await auth.login(db, { email: account.email, password: account.password }, NOW);
    const runSpy = vi.spyOn(db, 'run');

    // Act
    const customer = await admin.setCustomerActive(db, user.id, { isActive: false });

    // Assert: perintah yang dikirim tercatat, dan efeknya benar-benar terjadi.
    expect(runSpy).toHaveBeenCalledWith('DELETE FROM sessions WHERE user_id = ?', [user.id]);
    expect(customer.isActive).toBe(false);
    expect(await auth.getSessionUser(db, token, NOW)).toBeNull();
    await expect(auth.login(db, { email: account.email, password: account.password }, NOW)).rejects.toMatchObject({ status: 403 });

    runSpy.mockRestore();
  });

  test('mengaktifkan kembali pelanggan tidak menghapus sesi', async () => {
    // Arrange
    const db = await createFakeDb();
    const user = await auth.registerCustomer(db, account, NOW);
    await admin.setCustomerActive(db, user.id, { isActive: false });
    const runSpy = vi.spyOn(db, 'run');

    // Act
    await admin.setCustomerActive(db, user.id, { isActive: true });

    // Assert
    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(runSpy).not.toHaveBeenCalledWith('DELETE FROM sessions WHERE user_id = ?', [user.id]);

    runSpy.mockRestore();
  });
});
