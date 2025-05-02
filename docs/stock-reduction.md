# Fitur Pengurangan Stok

Dokumen ini menjelaskan implementasi fitur pengurangan stok pada aplikasi Teelite Club.

## Deskripsi

Fitur pengurangan stok secara otomatis mengurangi stok produk dan varian setelah pembayaran berhasil. Ini memastikan bahwa stok produk selalu akurat dan mencegah penjualan produk yang sudah habis.

## Implementasi

### 1. Fungsi Pengurangan Stok

Fungsi utama untuk mengurangi stok produk dan varian terdapat di `lib/services/products.ts`:

```typescript
export async function reduceProductStock(
  productId: string, 
  quantity: number, 
  variantId?: string
) {
  // Jika ada variantId, kurangi stok varian
  if (variantId) {
    const variant = await db.variant.findUnique({
      where: { id: variantId }
    });
    
    if (!variant) throw new Error(`Variant ${variantId} not found`);
    
    const newStock = Math.max(0, variant.stock - quantity);
    
    return db.variant.update({
      where: { id: variantId },
      data: { stock: newStock }
    });
  } 
  // Jika tidak ada variantId, kurangi stok produk
  else {
    const product = await db.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) throw new Error(`Product ${productId} not found`);
    
    const newStock = Math.max(0, product.stock - quantity);
    
    return db.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });
  }
}
```

### 2. Integrasi dengan Notifikasi Pembayaran

Pengurangan stok dipicu oleh notifikasi pembayaran dari Midtrans. Implementasi terdapat di dua file:

#### a. `app/api/payment/notification/route.ts`

```typescript
// Jika pembayaran berhasil, kurangi stok untuk setiap item
if (newStatus === "PAID") {
  try {
    // Proses setiap item pesanan
    for (const item of order.items) {
      await reduceProductStock(
        item.productId,
        item.quantity,
        item.variantId || undefined
      );
    }
  } catch (stockError) {
    console.error(`Error reducing stock for order ${orderId}:`, stockError);
    // Kita tidak ingin gagal seluruh request jika pengurangan stok gagal
    // Cukup log error dan lanjutkan
  }
}
```

#### b. `app/api/midtrans/notification/route.ts`

```typescript
// Jika pembayaran berhasil, kurangi stok untuk setiap item
if (orderStatus === "PAID") {
  try {
    // Proses setiap item pesanan
    for (const item of order.items) {
      await reduceProductStock(
        item.productId,
        item.quantity,
        item.variantId || undefined
      );
    }
  } catch (stockError) {
    console.error(`Error reducing stock for order ${order.id}:`, stockError);
    // Kita tidak ingin gagal seluruh request jika pengurangan stok gagal
    // Cukup log error dan lanjutkan
  }
}
```

### 3. Endpoint Testing

Untuk keperluan testing, terdapat endpoint khusus di `app/api/testing/reduce-stock/route.ts` yang dapat digunakan untuk menguji pengurangan stok tanpa harus melakukan pembayaran sungguhan. Endpoint ini hanya tersedia di mode development.

### 4. Halaman Admin untuk Testing

Terdapat halaman admin khusus di `/admin/test-stock` yang dapat digunakan untuk menguji pengurangan stok melalui UI. Halaman ini hanya tersedia di mode development.

## Alur Kerja

1. Pelanggan melakukan pembelian dan menyelesaikan pembayaran melalui Midtrans.
2. Midtrans mengirimkan notifikasi ke endpoint callback aplikasi.
3. Aplikasi memverifikasi notifikasi dan mengubah status pesanan menjadi "PAID" jika pembayaran berhasil.
4. Jika status pesanan berubah menjadi "PAID", aplikasi mengurangi stok untuk setiap item dalam pesanan.
5. Stok produk dan varian diperbarui di database.

## Catatan Penting

- Pengurangan stok hanya terjadi setelah pembayaran berhasil (status "PAID").
- Jika terjadi error saat mengurangi stok, aplikasi akan mencatat error tetapi tetap melanjutkan proses (tidak membatalkan transaksi).
- Stok tidak akan pernah menjadi negatif. Jika pengurangan melebihi stok yang tersedia, stok akan diatur menjadi 0.
- Untuk mode testing, gunakan halaman admin `/admin/test-stock` untuk menguji pengurangan stok tanpa melakukan pembayaran sungguhan.

## Pengembangan di Masa Depan

- Implementasi fitur untuk mengembalikan stok jika pesanan dibatalkan.
- Implementasi validasi stok saat checkout untuk mencegah pembelian produk yang stoknya tidak mencukupi.
- Implementasi notifikasi stok rendah untuk administrator.
