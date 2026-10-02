# Wedlify

Aplikasi web pemesanan undangan pernikahan digital dan cetak. Pengunjung melihat katalog dan paket harga, User mendaftar lalu membuat dan memantau pesanan, dan Admin memverifikasi pembayaran serta mengelola kode promo dan pelanggan.

## Menjalankan aplikasi

Prasyarat: Node.js 22.13 atau lebih baru (aplikasi memakai modul SQLite bawaan Node.js).

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Satu perintah itu menjalankan server API dan halaman web sekaligus. Peringatan `ExperimentalWarning: SQLite` di terminal dapat diabaikan.

Database dibuat otomatis di `data/wedlify.db`. Untuk mengulang dari keadaan awal, hentikan server lalu hapus folder `data`.

| Perintah | Kegunaan |
|----------|----------|
| `npm run dev` | Menjalankan aplikasi untuk pengembangan |
| `npm run build` lalu `npm start` | Menjalankan versi produksi |
| `npm run lint` | Pemeriksaan tipe TypeScript |

## Akun

| Role | Cara masuk |
|------|------------|
| Admin | `admin@gmail.com` dengan password `admin123` (dibuat otomatis) |
| User | Daftar lewat halaman Register |

Password Admin bawaan hanya untuk kebutuhan praktikum.

## Struktur kode

| Lokasi | Isi |
|--------|-----|
| `server/` | Server Express: `index.ts` (awal program lokal), `vercel.ts` (awal program online), `app.ts` (daftar endpoint), `db.ts` (tabel, data awal, dan koneksi database), `services/` (aturan akun, pesanan, dan admin) |
| `src/lib/` | Aturan yang dipakai bersama oleh browser dan server: `validation.ts`, `pricing.ts`, `orderRules.ts` |
| `src/pages/` | Halaman akun User, dan `src/pages/admin/` untuk halaman Admin |
| `src/components/` | Komponen landing page, dan `src/components/account/` untuk komponen halaman akun |
| `docs/` | [Catatan kebutuhan akun dan pesanan](docs/REQUIREMENTS_AKUN_PESANAN.md) dan [use case landing page](docs/USE_CASE_SPECIFICATION.md) |

## Versi online (Vercel)

Versi online memakai kode yang sama, dengan dua perbedaan: server berjalan sebagai satu fungsi `/api` di Vercel (`server/vercel.ts`), dan datanya disimpan di Turso, yaitu SQLite versi cloud, karena Vercel tidak menyimpan berkas secara menetap. Perintah SQL untuk lokal dan online sama persis.

```bash
npm run deploy
```

Perintah itu menyusun paket di `.vercel/output` lalu mengunggahnya ke project Vercel yang terhubung. Alamat dan token database dibaca dari environment variable `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` di Vercel.

Data lokal (`data/wedlify.db`) dan data online terpisah: akun yang dibuat di satu tempat tidak ada di tempat lain.
