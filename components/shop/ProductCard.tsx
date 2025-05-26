"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/constants";
import QuickAddToCart from "@/components/QuickAddToCart";
import { StockBadge } from "@/components/product/StockStatus";
import { HeartIcon, EyeIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  variants: any[];
}

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  index: number;
}

export default function ProductCard({ product, viewMode, index }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Calculate total stock correctly based on variants
  const totalStock = product.variants.length > 0
    ? product.variants.reduce((total, variant) => total + variant.stock, 0)
    : product.stock;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      >
        <div className="flex">
          {/* Image Section */}
          <div className="relative h-48 w-48 flex-shrink-0">
            <Link href={`/product/${product.id}`}>
              <div className="relative h-full w-full">
                {imageLoading && (
                  <div className="absolute inset-0 animate-pulse rounded-l-xl bg-gray-100" />
                )}
                <Image
                  src={product.images?.[0] || "/placeholder-image.svg"}
                  alt={product.name}
                  width={192}
                  height={192}
                  sizes="192px"
                  className={`h-full w-full rounded-l-xl object-cover transition-all duration-300 group-hover:scale-105 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setImageLoading(false)}
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 rounded-l-xl bg-black/0 transition-all duration-300 group-hover:bg-black/20" />

                {/* Quick view button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <button className="rounded-full bg-white/90 p-2 text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Link>

            {/* Stock overlay */}
            {totalStock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center rounded-l-xl bg-black/60">
                <span className="text-sm font-semibold text-white">Out of Stock</span>
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white"
            >
              {isWishlisted ? (
                <HeartSolidIcon className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/product/${product.id}`}>
                  <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-600">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
              </div>

              <StockBadge stock={totalStock} className="ml-4" />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-500">(4.5)</span>
              </div>
            </div>

            <QuickAddToCart product={product} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/product/${product.id}`}>
          {imageLoading && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
          <Image
            src={product.images?.[0] || "/placeholder-image.svg"}
            alt={product.name}
            width={400}
            height={300}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setImageLoading(false)}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />

          {/* Quick view button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <button className="rounded-full bg-white/90 p-3 text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white">
              <EyeIcon className="h-5 w-5" />
            </button>
          </div>
        </Link>

        {/* Stock overlay */}
        {totalStock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="font-semibold text-white">Out of Stock</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white"
        >
          {isWishlisted ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Stock status badge */}
        <div className="absolute left-3 top-3">
          <StockBadge stock={totalStock} />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-3">
          <Link href={`/product/${product.id}`}>
            <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-600">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-bold text-primary-600">{formatPrice(product.price)}</div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="h-4 w-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        <QuickAddToCart product={product} />
      </div>
    </motion.div>
  );
}
