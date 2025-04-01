"use client";

// app/cart/page.tsx
import React from "react";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import { formatPrice } from "@/constants";
import dynamicImport from 'next/dynamic';

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamicImport(() => import('@/components/Layout'), { ssr: false });

export const dynamic = "force-dynamic"; // Mark the page as dynamic

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Keranjang Belanja
        </h1>
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-6">Keranjang belanja Anda kosong.</p>
            <Link href="/">
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
                Lanjut Berbelanja
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li
                  key={item.product.id}
                  className="py-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      {item.product.variant && (
                        <p>Variant: {item.product.variant}</p>
                      )}
                    </div>
                    <p className="mt-1 text-gray-600">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) =>
                        updateQuantity(
                          item.product.id,
                          parseInt(e.target.value)
                        )
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={clearCart}
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300"
                >
                  Kosongkan Keranjang
                </button>
                <Link href="/checkout">
                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
                    Lanjut ke Pembayaran
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
