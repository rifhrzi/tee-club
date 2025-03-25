"use client";

// app/checkout/page.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import { PRODUCTS, formatPrice } from "@/constants";
import useCartStore from "@/store/cartStore";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
}

const PAYMENT_METHODS = [
  {
    id: "bank_transfer",
    name: "Transfer Bank",
    description: "Transfer melalui Bank BCA, Mandiri, atau BNI",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description: "Bayar dengan GoPay, OVO, atau DANA",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Bayar saat barang sampai",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart.length, router]);

  const [formData, setFormData] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "",
  });

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name as keyof CheckoutForm]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<CheckoutForm> = {};
    if (!formData.name) newErrors.name = "Nama harus diisi";
    if (!formData.email) newErrors.email = "Email harus diisi";
    if (!formData.phone) newErrors.phone = "Nomor telepon harus diisi";
    if (!formData.address) newErrors.address = "Alamat harus diisi";
    if (!formData.city) newErrors.city = "Kota harus diisi";
    if (!formData.postalCode) newErrors.postalCode = "Kode pos harus diisi";
    if (!formData.paymentMethod)
      newErrors.paymentMethod = "Metode pembayaran harus dipilih";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Process checkout
    alert("Pesanan berhasil dibuat!");
    clearCart();
    router.push("/");
  };

  if (!isClient) {
    return null; // atau tampilkan loading spinner
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.address ? "border-red-500" : ""
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kota
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.city ? "border-red-500" : ""
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kode Pos
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.postalCode ? "border-red-500" : ""
                  }`}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Metode Pembayaran
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.paymentMethod ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Pilih metode pembayaran</option>
                  <option value="transfer">Transfer Bank</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Buat Pesanan
              </button>
            </form>
          </div>

          {/* Order Summary Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.product.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {item.product.name}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        {item.product.variant && (
                          <>
                            <p>Ukuran: {item.product.variant.size}</p>
                            <p>Warna: {item.product.variant.color}</p>
                          </>
                        )}
                        <p>Jumlah: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
