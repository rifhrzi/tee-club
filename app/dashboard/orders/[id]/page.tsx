"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState("selesai");

  // Fungsi untuk memformat angka dengan konsisten
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  // Data dummy untuk contoh
  const orderData = {
    id: params.id,
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "081234567890",
      address: {
        street: "Jalan Contoh No. 123",
        city: "Jakarta",
        state: "DKI Jakarta",
        postalCode: "12345",
        country: "Indonesia",
      },
    },
    items: [
      {
        id: 1,
        name: "T-Shirt Basic",
        size: "L",
        quantity: 2,
        price: 150000,
        image: "/images/product1.jpg",
      },
      {
        id: 2,
        name: "T-Shirt Premium",
        size: "M",
        quantity: 1,
        price: 250000,
        image: "/images/product2.jpg",
      },
    ],
    payment: {
      method: "Transfer Bank BCA",
      proof: "/images/payment-proof.jpg",
      status: "Lunas",
      date: "2024-03-31 14:30",
    },
    shipping: {
      method: "JNE Regular",
      cost: 15000,
      trackingNumber: "JNE1234567890",
      estimatedDelivery: "2024-04-03",
    },
    orderDate: "2024-03-31 13:00",
    status: "selesai",
  };

  const totalItems = orderData.items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = orderData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + orderData.shipping.cost;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan #{orderData.id}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Tanggal Pesanan: {new Date(orderData.orderDate).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Menunggu Pembayaran</option>
                <option value="processing">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="delivered">Diterima</option>
                <option value="selesai">Selesai</option>
              </select>
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Informasi Pelanggan */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900">Informasi Pelanggan</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nama</h3>
                <p className="mt-1 text-sm text-gray-900">{orderData.customer.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{orderData.customer.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Telepon</h3>
                <p className="mt-1 text-sm text-gray-900">{orderData.customer.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Alamat Pengiriman</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {orderData.customer.address.street}
                  <br />
                  {orderData.customer.address.city}, {orderData.customer.address.state}{" "}
                  {orderData.customer.address.postalCode}
                  <br />
                  {orderData.customer.address.country}
                </p>
              </div>
            </div>
          </div>

          {/* Informasi Pengiriman */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900">Informasi Pengiriman</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Metode Pengiriman</h3>
                <p className="mt-1 text-sm text-gray-900">{orderData.shipping.method}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nomor Resi</h3>
                <p className="mt-1 text-sm text-gray-900">{orderData.shipping.trackingNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estimasi Pengiriman</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(orderData.shipping.estimatedDelivery).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Biaya Pengiriman</h3>
                <p className="mt-1 text-sm text-gray-900">
                  Rp {formatNumber(orderData.shipping.cost)}
                </p>
              </div>
            </div>
          </div>

          {/* Daftar Produk */}
          <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900">Daftar Produk</h2>
            <div className="mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ukuran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Harga Satuan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orderData.items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={item.image}
                              alt={item.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.size}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        Rp {formatNumber(item.price)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        Rp {formatNumber(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informasi Pembayaran */}
          <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900">Informasi Pembayaran</h2>
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Metode Pembayaran</h3>
                  <p className="mt-1 text-sm text-gray-900">{orderData.payment.method}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status Pembayaran</h3>
                  <p className="mt-1 text-sm text-gray-900">{orderData.payment.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Pembayaran</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(orderData.payment.date).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bukti Pembayaran</h3>
                  <div className="mt-1">
                    <img
                      src={orderData.payment.proof}
                      alt="Bukti Pembayaran"
                      className="h-32 w-auto rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Total */}
          <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900">Ringkasan Total</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Total Item</p>
                <p className="text-sm font-medium text-gray-900">{totalItems} item</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">Rp {formatNumber(subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Biaya Pengiriman</p>
                <p className="text-sm font-medium text-gray-900">
                  Rp {formatNumber(orderData.shipping.cost)}
                </p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <p className="text-base font-medium text-gray-900">Total</p>
                  <p className="text-base font-medium text-gray-900">Rp {formatNumber(total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
