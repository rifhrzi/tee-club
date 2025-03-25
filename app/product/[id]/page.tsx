"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { PRODUCTS, formatPrice, type Product } from "@/constants";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import Toast from "@/components/Toast";
import { motion } from "framer-motion";

const VARIANTS = {
  colors: [
    { id: "white", name: "Putih", hex: "#FFFFFF", border: true },
    { id: "black", name: "Hitam", hex: "#000000" },
    { id: "navy", name: "Navy", hex: "#000080" },
    { id: "gray", name: "Abu-abu", hex: "#808080" },
  ],
};

interface ProductVariant {
  size: string;
  color: string;
  quantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const product = PRODUCTS.newArrivals.find((p) => p.id === productId);
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const [showToast, setShowToast] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>({
    size: "",
    color: "",
    quantity: 1,
  });

  const [error, setError] = useState<string>("");

  const getAvailableStock = () => {
    if (!product) return 0;
    const cartItem = cart.find((item) => item.product.id === product.id);
    return cartItem ? product.stock - cartItem.quantity : product.stock;
  };

  const handleVariantChange = (
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setSelectedVariant((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedVariant.size || !selectedVariant.color) {
      setError("Silakan pilih ukuran dan warna terlebih dahulu");
      return;
    }

    const availableStock = getAvailableStock();
    if (selectedVariant.quantity > availableStock) {
      setError(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
      return;
    }

    // Add to cart with variant information
    addToCart({
      ...product,
      variant: {
        size: selectedVariant.size,
        color: selectedVariant.color,
      },
      quantity: selectedVariant.quantity,
    } as Product);

    // Show success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    // Reset selection
    setSelectedVariant({
      size: "",
      color: "",
      quantity: 1,
    });
    setError("");
  };

  if (!product) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            Produk yang Anda cari tidak tersedia.
          </p>
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
            >
              Kembali ke Toko
            </motion.button>
          </Link>
        </div>
      </Layout>
    );
  }

  const availableStock = getAvailableStock();

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[500px] object-cover rounded-lg"
            />
            {availableStock <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                <span className="text-white text-2xl font-bold px-4 py-2 bg-red-600 rounded-lg shadow-lg">
                  ⛔ Mohon Maaf, Stok Habis
                </span>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Deskripsi Produk
              </h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pilih Ukuran
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => handleVariantChange("size", size)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-2 px-4 text-sm font-medium rounded-md border
                      ${
                        selectedVariant.size === size
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-700 hover:border-blue-600"
                      }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pilih Warna
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {VARIANTS.colors.map((color) => (
                  <motion.button
                    key={color.id}
                    onClick={() => handleVariantChange("color", color.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    <span
                      className={`h-8 w-8 rounded-full border flex items-center justify-center
                        ${color.border ? "border-gray-300" : ""}
                        ${
                          selectedVariant.color === color.id
                            ? "ring-2 ring-blue-600"
                            : ""
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedVariant.color === color.id && (
                        <span
                          className={`text-${
                            color.id === "white" ? "gray-600" : "white"
                          }`}
                        >
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="sr-only">{color.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Jumlah
              </h2>
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() =>
                    handleVariantChange(
                      "quantity",
                      Math.max(1, selectedVariant.quantity - 1)
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 border rounded-md hover:bg-gray-100"
                  disabled={selectedVariant.quantity <= 1}
                >
                  -
                </motion.button>
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={selectedVariant.quantity}
                  onChange={(e) =>
                    handleVariantChange(
                      "quantity",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-20 px-3 py-2 border rounded-md text-center"
                />
                <motion.button
                  onClick={() =>
                    handleVariantChange(
                      "quantity",
                      Math.min(availableStock, selectedVariant.quantity + 1)
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 border rounded-md hover:bg-gray-100"
                  disabled={selectedVariant.quantity >= availableStock}
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Stok Tersedia: {availableStock}
                </span>
                {error && (
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-red-600"
                  >
                    {error}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="border-t border-gray-200 pt-6">
              <motion.button
                onClick={handleAddToCart}
                disabled={availableStock <= 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-md font-semibold transition duration-300
                  ${
                    availableStock <= 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {availableStock <= 0 ? "⛔ Stok Habis" : "🛒 Tambah ke Keranjang"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
      <Toast
        message={`✨ ${product.name} berhasil ditambahkan ke keranjang! 🛍️`}
        isVisible={showToast}
      />
    </Layout>
  );
}
