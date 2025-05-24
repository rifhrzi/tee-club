# Teelite Club - Online T-Shirt Store

Teelite Club adalah platform e-commerce modern untuk penjualan t-shirt premium dengan fokus pada kualitas dan kenyamanan.

## Fitur Utama

- 🛍️ Katalog Produk Lengkap
- 🔍 Detail Produk dengan Varian
- 🛒 Keranjang Belanja
- 💳 Sistem Checkout
- 📦 Manajemen Stok Real-time
- 🎨 UI/UX Modern dan Responsif

## Teknologi

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- PostgreSQL
- Prisma ORM
- Docker & Docker Compose

## Persyaratan Sistem

### Pengembangan Lokal

- Node.js 18.0.0 atau lebih tinggi
- npm atau yarn
- PostgreSQL 15 atau lebih tinggi

### Menggunakan Docker

- Docker Engine 20.10.0 atau lebih tinggi
- Docker Compose v2.0.0 atau lebih tinggi

## Instalasi

### Metode 1: Instalasi Lokal

1. Clone repositori

```bash
git clone https://github.com/yourusername/tee-club.git
cd tee-club
```

2. Install dependensi

```bash
npm install
# atau
yarn install
```

3. Jalankan development server

```bash
npm run dev
# atau
yarn dev
```

4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

### Metode 2: Menggunakan Docker

1. Clone repositori

```bash
git clone https://github.com/yourusername/tee-club.git
cd tee-club
```

2. Salin file environment

```bash
cp .env.example .env
```

3. Jalankan dengan Docker Compose

```bash
docker-compose up -d
```

4. Buka aplikasi di browser:

   - Aplikasi: [http://localhost:3000](http://localhost:3000)
   - pgAdmin (manajemen database): [http://localhost:5050](http://localhost:5050)

5. Untuk menghentikan aplikasi:

```bash
docker-compose down
```

### Perintah Docker Lainnya

```bash
# Membangun image tanpa cache
docker-compose build --no-cache

# Melihat logs aplikasi
docker-compose logs -f app

# Menjalankan migrasi database
docker-compose exec app npx prisma migrate deploy

# Menjalankan seed database
docker-compose exec app npx prisma db seed

# Menghentikan dan menghapus volume (hapus semua data)
docker-compose down -v
```

## Struktur Proyek

```
tee-club/
├── app/                    # Komponen halaman Next.js
├── components/            # Komponen React yang dapat digunakan kembali
├── constants/            # Konstanta dan tipe data
├── store/               # State management dengan Zustand
├── public/             # Aset statis
└── styles/            # Style sheets
```

## Fitur yang Akan Datang

- [ ] Sistem Autentikasi
- [ ] Manajemen Profil Pengguna
- [ ] Sistem Review Produk
- [ ] Wishlist
- [ ] Notifikasi Real-time
- [ ] Sistem Pencarian Lanjutan

## Kontribusi

Kami sangat menghargai kontribusi Anda! Silakan buat pull request atau laporkan masalah di bagian Issues.

## Lisensi

[MIT](LICENSE)

## Kontak

Untuk pertanyaan atau dukungan, silakan hubungi kami di [email@example.com](mailto:email@example.com)
