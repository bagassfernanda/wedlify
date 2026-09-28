# Checklist Tugas — Spesifikasi Kebutuhan Project Wedlify

Dicek pada: 28 September 2026
Batas pengumpulan: **Selasa, 29 September 2026 pukul 21.00 WIB**

## Ringkasan Ketentuan Tugas

1. Sediakan satu aplikasi yang telah dibuat sebelumnya.
2. Buat **salah satu** bentuk spesifikasi kebutuhan dari project tersebut:
   - (a) Teks tertulis: user story, SRS, atau requirement document lainnya, **atau**
   - (b) Use case diagram beserta use case dan use case description-nya.
3. Tugas dikumpulkan hari Selasa, 29 September pukul 21.00 WIB.

## Status Pemenuhan

| No | Ketentuan | Status | Keterangan |
|----|-----------|--------|------------|
| 1 | Ada aplikasi yang sudah dibuat | ✅ Sudah | Wedlify: landing page layanan undangan pernikahan digital & cetak (React + Vite + TypeScript + Tailwind), sudah terhubung ke Vercel. |
| 2a | Dokumen teks (user story / SRS / requirement document) | ➖ Tidak dikerjakan | Tidak wajib, karena tugas hanya meminta salah satu (sudah dipenuhi lewat 2b). |
| 2b | Use case diagram + use case + use case description | ✅ Sudah | `docs/use-case-diagram.png` (sumber: `docs/use-case-diagram.puml`) dan `docs/USE_CASE_SPECIFICATION.md` (2 aktor, 12 use case beserta deskripsinya). |
| 2 | **Minimal salah satu dari 2a atau 2b** | ✅ **Terpenuhi** (lewat 2b) | Cukup mengerjakan salah satu; yang dipilih adalah use case diagram + description. |
| 3 | Dikumpulkan tepat waktu | ⏳ Belum | Tersisa ±1 hari (deadline besok, 29/09 pukul 21.00 WIB). |

**Kesimpulan:** Poin 1 dan 2 **sudah terpenuhi**. Tinggal poin 3: mengumpulkan tugas sebelum deadline.

## Bahan untuk Menyusun Spesifikasi (hasil analisis kode)

Fitur yang benar-benar ada di aplikasi saat ini:

| No | Fitur | Lokasi kode |
|----|-------|-------------|
| F1 | Layar sambutan (welcome screen) sebelum masuk ke halaman utama | `src/components/WelcomeScreen.tsx` |
| F2 | Navigasi antar bagian halaman (desktop & menu mobile) | `src/components/Navbar.tsx` |
| F3 | Informasi tentang Wedlify & keunggulannya | `src/components/Hero.tsx`, `About.tsx` |
| F4 | Informasi layanan (website undangan, RSVP, musik, Maps, galeri, mobile friendly) | `src/components/Services.tsx` |
| F5 | Katalog 12 template undangan + filter kategori + preview (modal) + pilih template | `src/components/TemplateCatalog.tsx` |
| F6 | Demo undangan online (iframe ke situs contoh) | `src/components/WeddingDemo.tsx` |
| F7 | Testimoni pelanggan | `src/components/Testimonials.tsx` |
| F8 | Daftar paket harga (Basic Rp150rb, Standard Rp300rb, Premium Rp500rb) + pilih paket | `src/components/Pricing.tsx` |
| F9 | Form pemesanan dengan validasi (nama pengantin, tanggal, lokasi, tema, paket, catatan) → dikirim ke WhatsApp admin | `src/components/OrderForm.tsx` |
| F10 | Kontak (Instagram, WhatsApp, Email) + tombol WhatsApp melayang | `src/components/ContactSection.tsx`, `WhatsAppButton.tsx` |

Aktor yang teridentifikasi:

- **Pengunjung / Calon Pelanggan**: melihat informasi, katalog, demo, harga, lalu memesan.
- **Admin Wedlify**: menerima pesanan dan pertanyaan lewat WhatsApp/Email (di luar sistem).

Catatan penting saat menulis spesifikasi:

- Fitur seperti RSVP, musik, galeri, dan Google Maps adalah fitur **produk undangan yang dijual**, bukan fitur yang berjalan di website Wedlify ini. Tulis sebagai "informasi layanan" agar spesifikasi sesuai dengan aplikasi yang sebenarnya.
- Aplikasi tidak memiliki login, database, maupun panel admin. Pemesanan diteruskan ke WhatsApp, jadi jangan menuliskan kebutuhan yang tidak ada di aplikasi.

## To-Do Sebelum Deadline

- [x] Pilih bentuk spesifikasi: dipilih **(b) Use Case Diagram + Description**
- [x] Gambar use case diagram: `docs/use-case-diagram.png`
- [x] Tulis use case description untuk setiap use case: `docs/USE_CASE_SPECIFICATION.md`
- [ ] Baca ulang dokumennya dan sesuaikan dengan format yang diminta dosen (jika ada)
- [ ] Siapkan aplikasi untuk ditunjukkan (link Vercel atau `npm run dev`)
- [ ] (Opsional) Perbarui `README.md` agar menjelaskan Wedlify, bukan template AI Studio
- [ ] Kumpulkan sebelum **Selasa, 29 September 2026 pukul 21.00 WIB**
