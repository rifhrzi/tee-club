"use client";

import React, { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { PRODUCTS, formatPrice, type Product } from "@/constants";
import useCartStore from "@/store/cartStore";
import Toast from "@/components/Toast";
import { motion } from "framer-motion";

export default function ShopPage() {
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const [showToast, setShowToast] = useState(false);
  const [animatingProduct, setAnimatingProduct] = useState<number | null>(null);

  const getAvailableStock = (product: Product) => {
    const cartItem = cart.find((item) => item.product.id === product.id);
    return cartItem ? product.stock - cartItem.quantity : product.stock;
  };

  const handleAddToCart = (product: Product) => {
    const availableStock = getAvailableStock(product);
    if (availableStock > 0) {
      setAnimatingProduct(product.id);
      setTimeout(() => {
        addToCart(product);
        setShowToast(true);
        setAnimatingProduct(null);
        setTimeout(() => setShowToast(false), 2000);
      }, 300);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0)
      return { text: "⛔ Stok Habis", color: "text-red-700 font-semibold" };
    if (stock <= 5)
      return {
        text: "⚠️ Sisa Stok: 5",
        color: "text-orange-700 font-semibold",
      };
    if (stock <= 10)
      return {
        text: "📉 Sisa Stok < 10",
        color: "text-yellow-700 font-semibold",
      };
    return { text: "✅ Stok Tersedia", color: "text-green-700 font-semibold" };
  };

  return (
    <Layout>
      <div className="bg-white">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Katalog Produk</h1>
            <div className="flex items-center space-x-4">
              {/* Filter dan pengurutan akan ditambahkan di sini */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.newArrivals.map((product) => {
              const availableStock = getAvailableStock(product);
              const stockStatus = getStockStatus(availableStock);
              const isAnimating = animatingProduct === product.id;

              return (
                <motion.div
                  key={product.id}
                  className="group relative bg-white rounded-lg shadow-lg overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/product/${product.id}`}>
                    <motion.div
                      className="w-full min-h-80 aspect-w-1 aspect-h-1 overflow-hidden group-hover:opacity-75 relative"
                      animate={
                        isAnimating
                          ? {
                              scale: [1, 0.9, 1],
                              transition: { duration: 0.3 },
                            }
                          : {}
                      }
                    >
                      <img
                        src={product.image}
                        alt={`Gambar ${product.name}`}
                        className="w-full h-[300px] object-cover object-center"
                      />
                      {availableStock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                          <span className="text-white text-xl font-bold px-4 py-2 bg-red-600 rounded-lg shadow-lg">
                            ⛔ Mohon Maaf, Stok Habis
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900">
                          <Link href={`/product/${product.id}`}>
                            <span className="hover:text-blue-600 transition-colors">
                              {product.name}
                            </span>
                          </Link>
                        </h3>
                        <span
                          className={`text-sm font-medium ${stockStatus.color}`}
                        >
                          {stockStatus.text}
                        </span>
                      </div>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {product.description ||
                          "T-Shirt premium dengan bahan katun combed 30s yang nyaman dipakai sehari-hari"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-800 font-medium">
                          Tersedia Ukuran:
                        </span>
                        <div className="flex gap-1">
                          {product.sizes.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center px-2 py-0.5 border border-gray-300 bg-gray-50 text-xs font-medium text-gray-800 rounded"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center space-x-2">
                      <Link href={`/product/${product.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          🔍 Lihat Detail
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigasi halaman */}
          <div className="mt-8 flex justify-center">
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Navigasi Halaman"
            >
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="sr-only">Halaman Sebelumnya</span>← Sebelumnya
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                2
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                3
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="sr-only">Halaman Selanjutnya</span>
                Selanjutnya →
              </a>
            </nav>
          </div>
        </div>
      </div>
      <Toast message="Produk berhasil ditambahkan ke keranjang! 🛍️" isVisible={showToast} />
    </Layout>
  );
}
