# Software Requirements Document: Akun dan Pesanan Wedlify

Dokumen ini adalah Software Requirements Document (test basis) untuk fitur akun dan pesanan Wedlify. Setiap kebutuhan role User bernomor REQ dan menjadi dasar Test Design Specification serta Test Traceability Matrix pada Modul 2. Kebutuhan untuk Pengunjung (landing page) ada di [USE_CASE_SPECIFICATION.md](USE_CASE_SPECIFICATION.md).

Catatan: bagian "Batasan sistem" pada dokumen use case (tanpa login, tanpa database) hanya berlaku untuk Pengunjung.

## 1. Role

| Role | Deskripsi | Cara mendapat akun | Diuji pada praktikum |
|------|-----------|--------------------|----------------------|
| User (Pelanggan) | Membuat pesanan, mengonfirmasi pembayaran, dan memantau status | Register sendiri | Ya |
| Admin | Memverifikasi pembayaran, menyelesaikan pesanan, mengelola kode promo dan pelanggan | Dibuat otomatis: `admin@gmail.com` / `admin123` | Tidak |
| Pengunjung | Melihat landing page dan memesan cepat lewat WhatsApp tanpa akun | Tidak perlu akun | Tidak |

User dan Admin masuk lewat halaman login yang sama, lalu diarahkan ke halaman yang berbeda. User tidak dapat membuka halaman Admin, dan Admin tidak dapat membuka halaman User.

## 2. Fitur Role User (8 fitur)

| ID | Fitur | Kelompok | Halaman | Kode utama |
|----|-------|----------|---------|------------|
| F01 | Register | Wajib | `#/register` | `server/services/auth.ts` → `registerCustomer` |
| F02 | Login | Wajib | `#/login` | `server/services/auth.ts` → `login`, `logout`, `getSessionUser` |
| F03 | Forgot Password | Wajib | `#/forgot-password` | `server/services/auth.ts` → `requestPasswordReset`, `resetPassword` |
| F04 | Kelola Pesanan (buat, lihat, ubah, hapus) | Additional | `#/orders/new`, `#/orders/:id`, `#/orders/:id/edit` | `server/services/orders.ts` → `createOrder`, `getOrder`, `updateOrder`, `deleteOrder` |
| F05 | Perhitungan Harga dan Kode Promo | Additional | `#/orders/new`, `#/orders/:id/edit` | `src/lib/pricing.ts` → `calculateOrderTotal` |
| F06 | Cari dan Filter Pesanan | Additional | `#/orders` | `src/lib/orderRules.ts` → `filterOrders` |
| F07 | Konfirmasi Pembayaran dan Status Pesanan | Additional | `#/orders/:id` | `server/services/orders.ts` → `confirmPayment`, `cancelOrder` |
| F08 | Kelola Profil dan Ubah Password | Additional | `#/profile` | `server/services/auth.ts` → `updateProfile`, `changePassword` |

## 3. Software Requirements Role User

Setiap kebutuhan merujuk aturan bisnis (BR) pada bagian 5, yang memuat nilai batas dan pesan yang diharapkan.

| ID | Kebutuhan | Fitur | Aturan bisnis |
|----|-----------|-------|---------------|
| REQ-001 | Sistem harus memungkinkan pendaftaran akun User dengan nama, email, nomor WhatsApp, password, dan konfirmasi password yang valid. | F01 | BR-01, BR-02, BR-04, BR-05, BR-06, BR-07 |
| REQ-002 | Sistem harus menolak pendaftaran dengan email yang sudah terdaftar. | F01 | BR-03 |
| REQ-003 | Sistem harus memungkinkan User masuk dengan email dan password yang benar, lalu mempertahankan sesinya sampai logout. | F02 | BR-10 |
| REQ-004 | Sistem harus menolak login yang gagal dengan menampilkan sisa percobaan, dan mengunci akun selama 5 menit setelah 5 kali gagal berturut-turut. | F02 | BR-08, BR-09 |
| REQ-005 | Sistem harus membatasi halaman akun hanya untuk pengguna yang sudah login dan sesuai role-nya. | F02 | BR-11, BR-19 |
| REQ-006 | Sistem harus memungkinkan User keluar dan mengakhiri sesinya. | F02 | BR-10 |
| REQ-007 | Sistem harus membuat kode reset 6 digit yang berlaku 10 menit untuk email User yang terdaftar. | F03 | BR-12, BR-15 |
| REQ-008 | Sistem harus mengganti password dengan kode reset yang benar dan password baru yang valid, serta menolak kode yang salah, kedaluwarsa, atau sudah 3 kali salah. | F03 | BR-12, BR-13, BR-14 |
| REQ-009 | Sistem harus memungkinkan User membuat pesanan dengan data yang valid, memberi nomor pesanan, dan menetapkan status Menunggu Pembayaran. | F04 | BR-20 sampai BR-24, BR-26, BR-40 |
| REQ-010 | Sistem harus menolak data pesanan yang berada di luar aturan nama pengantin, tanggal pernikahan, jumlah tamu, lokasi, tema, paket, dan catatan desain. | F04 | BR-20 sampai BR-24 |
| REQ-011 | Sistem harus menolak pesanan baru jika User sudah memiliki 3 pesanan berstatus Menunggu Pembayaran. | F04 | BR-25 |
| REQ-012 | Sistem harus menampilkan detail pesanan hanya kepada User pemilik pesanan tersebut. | F04 | BR-27 |
| REQ-013 | Sistem harus memungkinkan User mengubah pesanan hanya saat berstatus Menunggu Pembayaran, dan menghitung ulang harganya. | F04 | BR-41 |
| REQ-014 | Sistem harus memungkinkan User menghapus pesanan hanya saat berstatus Dibatalkan. | F04 | BR-47 |
| REQ-015 | Sistem harus menghitung total pesanan dari harga paket ditambah biaya cetak tambahan 0 sampai 500 lembar. | F05 | BR-30, BR-31, BR-33 |
| REQ-016 | Sistem harus menolak cetak tambahan pada paket Basic. | F05 | BR-32 |
| REQ-017 | Sistem harus menerapkan diskon kode promo sesuai jenis, minimal subtotal, dan maksimal diskonnya. | F05 | BR-34, BR-35, BR-36 |
| REQ-018 | Sistem harus menolak kode promo yang tidak dikenal atau nonaktif. | F05 | BR-36, BR-63 |
| REQ-019 | Sistem harus menampilkan daftar pesanan milik User dari yang terbaru, atau pesan bahwa belum ada pesanan. | F06 | BR-27 |
| REQ-020 | Sistem harus memungkinkan User mencari pesanan berdasarkan nomor pesanan, nama pengantin, atau tema. | F06 | - |
| REQ-021 | Sistem harus memungkinkan User menyaring pesanan berdasarkan status. | F06 | BR-40 sampai BR-51 |
| REQ-022 | Sistem harus memungkinkan User mengonfirmasi pembayaran dengan metode, nama pengirim, nominal yang sama dengan total, dan tanggal yang valid, lalu mengubah status menjadi Menunggu Verifikasi. | F07 | BR-42 sampai BR-45 |
| REQ-023 | Sistem harus memungkinkan User membatalkan pesanan hanya saat berstatus Menunggu Pembayaran. | F07 | BR-46 |
| REQ-024 | Sistem harus menampilkan status pesanan terbaru dan alasan penolakan pembayaran, serta memungkinkan konfirmasi ulang setelah ditolak. | F07 | BR-48 sampai BR-51 |
| REQ-025 | Sistem harus memungkinkan User mengubah nama dan nomor WhatsApp dengan data yang valid. | F08 | BR-01, BR-04, BR-17 |
| REQ-026 | Sistem harus memungkinkan User mengubah password setelah memasukkan password saat ini yang benar. | F08 | BR-05, BR-16 |

## 4. Fitur Role Admin

| ID | Fitur | Halaman | Kode utama |
|----|-------|---------|------------|
| A01 | Dashboard ringkasan (jumlah pelanggan, pesanan per status, pendapatan terverifikasi) | `#/admin` | `server/services/admin.ts` → `getSummary` |
| A02 | Verifikasi pembayaran (terima, atau tolak dengan alasan) | `#/admin/orders/:id` | `approvePayment`, `rejectPayment` |
| A03 | Penyelesaian pesanan | `#/admin/orders/:id` | `completeOrder` |
| A04 | Kelola kode promo (tambah, ubah, nonaktifkan, hapus) | `#/admin/promos` | `createPromo`, `updatePromo`, `deletePromo` |
| A05 | Kelola pelanggan (lihat, nonaktifkan, aktifkan) | `#/admin/customers` | `listCustomers`, `setCustomerActive` |

Admin juga dapat melihat dan mencari semua pesanan dari semua pelanggan di `#/admin/orders`.

## 5. Aturan Bisnis

Aturan validasi form ada di `src/lib/validation.ts` dan dijalankan dua kali: di browser saat form dikirim, lalu di server sebelum data disimpan.

### Akun

| ID | Aturan |
|----|--------|
| BR-01 | Nama lengkap 3 sampai 50 karakter, hanya huruf, spasi, titik, dan apostrof. |
| BR-02 | Email harus berformat valid, maksimal 100 karakter, dan disimpan dalam huruf kecil tanpa spasi di awal atau akhir. |
| BR-03 | Satu email hanya dapat dipakai untuk satu akun. |
| BR-04 | Nomor WhatsApp diawali `08` dan terdiri dari 10 sampai 13 digit angka. |
| BR-05 | Password 8 sampai 64 karakter dan mengandung minimal satu huruf dan satu angka. |
| BR-06 | Konfirmasi password harus sama dengan password. |
| BR-07 | Setelah register berhasil, pengguna diarahkan ke halaman login dan belum otomatis masuk. Akun hasil register selalu ber-role User. |
| BR-08 | Login gagal menampilkan sisa percobaan. Setelah 5 kali gagal berturut-turut, akun dikunci 5 menit. |
| BR-09 | Selama terkunci, login ditolak walaupun password benar. Setelah 5 menit, kunci terbuka dan hitungan gagal kembali 0. |
| BR-10 | Login berhasil mengembalikan hitungan gagal ke 0. Sesi bertahan setelah halaman dimuat ulang sampai pengguna logout atau 7 hari berlalu. |
| BR-11 | Halaman akun hanya dapat dibuka setelah login. Tanpa login, pengguna diarahkan ke halaman login lalu dikembalikan ke halaman tujuan setelah berhasil masuk. |
| BR-12 | Kode reset password berupa 6 digit angka, berlaku 10 menit, dan hanya dapat dipakai satu kali. |
| BR-13 | Kode reset yang salah 3 kali menjadi tidak berlaku, dan pengguna harus meminta kode baru. |
| BR-14 | Password baru hasil reset tidak boleh sama dengan password lama. Reset yang berhasil membuka kunci akun dan mengakhiri semua sesi akun itu. |
| BR-15 | Kode reset hanya dibuat untuk email User yang terdaftar. Karena belum ada layanan email, kode ditampilkan di layar sebagai simulasi email. Akun Admin tidak dapat di-reset lewat fitur ini. |
| BR-16 | Ubah password memerlukan password saat ini yang benar, dan password baru tidak boleh sama dengan password saat ini. |
| BR-17 | Email akun tidak dapat diubah. |
| BR-18 | Akun yang dinonaktifkan Admin langsung keluar dari semua sesi dan tidak dapat login sampai diaktifkan kembali. |
| BR-19 | User yang membuka halaman Admin diarahkan ke Pesanan Saya. Admin yang membuka halaman User diarahkan ke Dashboard Admin. |

### Pesanan

| ID | Aturan |
|----|--------|
| BR-20 | Nama pengantin wanita dan pria masing-masing 2 sampai 50 karakter. |
| BR-21 | Tanggal pernikahan paling cepat 7 hari dan paling lambat 730 hari dari hari ini. |
| BR-22 | Jumlah tamu berupa bilangan bulat 10 sampai 2000. |
| BR-23 | Lokasi 5 sampai 100 karakter. |
| BR-24 | Tema undangan dan paket wajib dipilih. Catatan desain opsional, maksimal 500 karakter. |
| BR-25 | Satu User maksimal memiliki 3 pesanan berstatus Menunggu Pembayaran saat membuat pesanan baru. |
| BR-26 | Nomor pesanan berformat `WDL-0001`, bertambah berurutan, dan tidak dipakai ulang walaupun pesanan dihapus. |
| BR-27 | User hanya dapat melihat dan mengelola pesanan miliknya sendiri. |

### Harga dan promo

| ID | Aturan |
|----|--------|
| BR-30 | Harga paket: Basic Rp 150.000, Standard Rp 300.000, Premium Rp 500.000. |
| BR-31 | Cetak tambahan berupa bilangan bulat 0 sampai 500 lembar dengan harga Rp 3.000 per lembar. |
| BR-32 | Cetak tambahan hanya tersedia untuk paket Standard dan Premium. Paket Basic harus bernilai 0. |
| BR-33 | Subtotal = harga paket + biaya cetak tambahan. Total = subtotal - diskon. Diskon tidak pernah melebihi subtotal. |
| BR-34 | Kode `WEDLIFY10` (promo awal): diskon 10% dari subtotal, subtotal minimal Rp 300.000, diskon maksimal Rp 75.000. |
| BR-35 | Kode `NIKAH50` (promo awal): diskon Rp 50.000, subtotal minimal Rp 500.000. |
| BR-36 | Kode promo tidak membedakan huruf besar dan kecil. Kode yang tidak dikenal atau nonaktif ditolak. Hanya satu kode per pesanan. |
| BR-37 | Diskon pesanan yang sudah dibuat tidak berubah walaupun Admin kemudian mengubah atau menghapus kode promonya. |

### Status pesanan

| ID | Aturan |
|----|--------|
| BR-40 | Pesanan baru berstatus Menunggu Pembayaran. |
| BR-41 | Pesanan hanya dapat diubah saat berstatus Menunggu Pembayaran. Harga dihitung ulang setiap kali pesanan diubah. |
| BR-42 | User mengonfirmasi pembayaran hanya saat berstatus Menunggu Pembayaran, dan status menjadi Menunggu Verifikasi. |
| BR-43 | Nominal transfer harus sama persis dengan total tagihan. |
| BR-44 | Tanggal pembayaran tidak boleh melebihi hari ini dan tidak boleh sebelum tanggal pesanan dibuat. |
| BR-45 | Metode pembayaran: Transfer Bank, QRIS, atau E-Wallet. Nama pengirim mengikuti aturan BR-01. |
| BR-46 | User membatalkan pesanan hanya saat berstatus Menunggu Pembayaran, dan status menjadi Dibatalkan. |
| BR-47 | User menghapus pesanan hanya saat berstatus Dibatalkan. |
| BR-48 | Admin menerima pembayaran hanya saat berstatus Menunggu Verifikasi, dan status menjadi Diproses. |
| BR-49 | Admin menolak pembayaran hanya saat berstatus Menunggu Verifikasi, dengan alasan 5 sampai 200 karakter. Status kembali ke Menunggu Pembayaran, alasan ditampilkan kepada User, dan User dapat mengonfirmasi ulang. |
| BR-50 | Admin menyelesaikan pesanan hanya saat berstatus Diproses, dan status menjadi Selesai. |
| BR-51 | Pesanan berstatus Selesai atau Dibatalkan tidak dapat berpindah ke status lain. |

```
                      konfirmasi (User)                    terima (Admin)             selesaikan (Admin)
Menunggu Pembayaran ---------------------> Menunggu Verifikasi ---------------> Diproses ------------------> Selesai
     |      ^                                      |
     |      +----------- tolak (Admin) ------------+
     | batalkan (User)
     v
 Dibatalkan --- hapus (User) ---> (pesanan terhapus)
```

### Kode promo dan pelanggan (Admin)

| ID | Aturan |
|----|--------|
| BR-60 | Kode promo 4 sampai 15 karakter, hanya huruf dan angka, disimpan dalam huruf besar, dan tidak boleh sama dengan kode lain. |
| BR-61 | Promo persen bernilai 1 sampai 100 dan boleh memiliki maksimal diskon. |
| BR-62 | Promo potongan tetap bernilai minimal 1, tidak boleh melebihi minimal subtotalnya, dan tidak memiliki maksimal diskon. |
| BR-63 | Promo nonaktif tidak dapat dipakai User. |
| BR-64 | Admin hanya dapat menonaktifkan akun ber-role User. |

## 6. Penyimpanan Data

Data disimpan di database SQLite. Versi lokal memakai berkas `data/wedlify.db`, yang dibuat otomatis saat server pertama kali dijalankan. Versi online memakai Turso, yaitu SQLite versi cloud, dengan tabel dan perintah SQL yang sama. Kedua database terpisah. Browser tidak menyimpan data; browser hanya memegang cookie sesi.

Semua aturan tanggal ("hari ini", H+7, tanggal pembayaran) memakai Waktu Indonesia Barat, baik di browser maupun di server.

| Tabel | Isi |
|-------|-----|
| `users` | Akun User dan Admin. Password disimpan sebagai hash scrypt dengan salt, bukan teks asli. |
| `sessions` | Sesi login yang aktif. Token sesi dikirim ke browser sebagai cookie `wedlify_session` (HttpOnly). |
| `password_resets` | Kode reset password yang masih aktif. |
| `orders` | Seluruh pesanan beserta rincian harga, data pembayaran, dan alasan penolakan. |
| `promos` | Kode promo yang dikelola Admin. |

Yang perlu diketahui saat pengujian:

- Semua browser dan perangkat yang membuka server yang sama melihat data yang sama, sehingga beberapa User dan Admin dapat login bersamaan.
- Pada versi lokal, menghapus folder `data` saat server mati mengembalikan aplikasi ke keadaan awal: hanya akun Admin dan dua promo awal. Data versi online tidak ikut terhapus.
- Belum ada layanan email, sehingga kode reset password ditampilkan di layar.
- Password Admin bawaan (`admin123`) hanya untuk kebutuhan praktikum dan harus diganti jika aplikasi dipakai sungguhan.

## 7. API

Semua endpoint berada di bawah `/api`, menerima dan mengembalikan JSON, dan memakai cookie sesi. Kesalahan dikembalikan sebagai `{ "error": "...", "field": "..." }`.

| Endpoint | Role | Kegunaan |
|----------|------|----------|
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Semua | Akun dan sesi |
| `POST /auth/forgot-password`, `POST /auth/reset-password` | Semua | Reset password |
| `PATCH /profile`, `POST /profile/password` | User, Admin | Profil dan password |
| `GET /orders`, `POST /orders`, `GET /orders/:id`, `PUT /orders/:id`, `DELETE /orders/:id` | User | CRUD pesanan |
| `POST /orders/quote` | User | Hitung rincian harga |
| `POST /orders/:id/payment`, `POST /orders/:id/cancel` | User | Perubahan status oleh User |
| `GET /admin/summary`, `GET /admin/orders`, `GET /admin/orders/:id` | Admin | Dashboard dan daftar pesanan |
| `POST /admin/orders/:id/approve`, `/reject`, `/complete` | Admin | Perubahan status oleh Admin |
| `GET /admin/customers`, `PATCH /admin/customers/:id` | Admin | Kelola pelanggan |
| `GET /admin/promos`, `POST /admin/promos`, `PUT /admin/promos/:id`, `DELETE /admin/promos/:id` | Admin | Kelola kode promo |
