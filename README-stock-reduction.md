# Fitur Pengurangan Stok - Teelite Club

## Deskripsi

Fitur ini secara otomatis mengurangi stok produk dan varian setelah pembayaran berhasil. Ini memastikan bahwa stok produk selalu akurat dan mencegah penjualan produk yang sudah habis.

## Cara Kerja

1. Ketika pembayaran berhasil (status "settlement" atau "capture" dari Midtrans), sistem akan mengubah status pesanan menjadi "PAID".
2. Setelah status pesanan berubah menjadi "PAID", sistem akan mengurangi stok untuk setiap item dalam pesanan.
3. Jika item memiliki varian, stok varian akan dikurangi. Jika tidak, stok produk akan dikurangi.

## Pengujian

### Pengujian Melalui UI Admin

1. Buka halaman admin di `/admin/test-stock`
2. Pilih produk yang ingin diuji
3. Pilih varian (opsional)
4. Masukkan jumlah stok yang ingin dikurangi
5. Klik tombol "Test Stock Reduction"
6. Lihat hasil pengurangan stok

### Pengujian Melalui API

Anda dapat menguji pengurangan stok melalui API dengan mengirimkan request POST ke endpoint `/api/testing/reduce-stock` dengan body:

```json
{
  "productId": "id_produk",
  "variantId": "id_varian", // opsional
  "quantity": 1
}
```

Contoh menggunakan curl:

```bash
curl -X POST http://localhost:3000/api/testing/reduce-stock \
  -H "Content-Type: application/json" \
  -d '{"productId":"id_produk","quantity":1}'
```

### Pengujian Melalui Pembayaran Sungguhan

1. Tambahkan produk ke keranjang
2. Lakukan checkout
3. Selesaikan pembayaran melalui Midtrans
4. Setelah pembayaran berhasil, stok produk akan berkurang secara otomatis

## Catatan Penting

- Fitur pengurangan stok hanya berfungsi setelah pembayaran berhasil.
- Stok tidak akan pernah menjadi negatif. Jika pengurangan melebihi stok yang tersedia, stok akan diatur menjadi 0.
- Halaman admin untuk pengujian stok hanya tersedia di mode development.

## Dokumentasi Teknis

Untuk dokumentasi teknis lebih detail, lihat file [docs/stock-reduction.md](docs/stock-reduction.md).
