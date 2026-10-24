# PLUT Admin Dashboard

Dashboard admin mandiri (Next.js, port 3001) untuk mengelola katalog produk UMKM Kebumen.
Terpisah dari web publik (port 3000) dan dari backend API (repo `plut-api`, port 8000).

## Fitur

- Login admin dengan token Sanctum, lupa password, dan atur ulang password
- Kelola produk: lihat, cari, filter, tambah, edit, hapus
- Unggah foto produk dengan konfirmasi dan pratinjau
- Sanitasi input, batas panjang, notifikasi, dan konfirmasi hapus

## Menjalankan

Prasyarat: Node.js dan API `plut-api` yang sudah berjalan di http://127.0.0.1:8000.

    npm install
    copy .env.example .env.local
    npm run dev

Buka http://127.0.0.1:3001 (gunakan 127.0.0.1, bukan localhost).

## Variabel lingkungan

- NEXT_PUBLIC_API_URL: alamat API Laravel
- NEXT_PUBLIC_SITE_URL: alamat web publik, untuk menampilkan foto produk bawaan

## Struktur

- app/admin/login, forgot-password, reset-password: halaman akun
- app/admin/dashboard: ringkasan dan kelola produk (dilindungi sesi)
- components: komponen UI (dialog, notifikasi, form produk)
- lib: klien API (Axios, Bearer token), logika produk, sanitasi

## Catatan keamanan

- Semua halaman di /admin/dashboard memerlukan token yang valid
- Token disimpan di localStorage dan dicabut saat keluar
- Jangan commit file .env.local