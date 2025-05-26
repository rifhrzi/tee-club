"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/constants";
import { TruckIcon, ShieldCheckIcon, ArrowPathIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import StockStatus, { StockAlert } from "@/components/product/StockStatus";

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  variants: Variant[];
}

interface ProductInfoProps {
  product: Product;
  selectedVariant: Variant | null;
  onVariantSelect: (variant: Variant | null) => void;
}

export default function ProductInfo({
  product,
  selectedVariant,
  onVariantSelect,
}: ProductInfoProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  // Calculate stock correctly based on variants
  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product.variants.length > 0
      ? product.variants.reduce((total, variant) => total + variant.stock, 0)
      : product.stock;

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // In real app, this would make an API call to update wishlist
  };

  return (
    <div className="space-y-6">
      {/* Product Title and Price */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">{product.name}</h1>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="rounded-full border border-gray-300 p-2 transition-all duration-200 hover:border-red-300 hover:bg-red-50"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Price */}
        <div className="mt-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-primary-600">{formatPrice(currentPrice)}</span>
            {selectedVariant && selectedVariant.price !== product.price && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-3">
            <StockStatus stock={currentStock} size="md" />
          </div>
        </div>
      </motion.div>

      {/* Stock Alert */}
      <StockAlert stock={currentStock} threshold={5} />

      {/* Product Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="border-t border-gray-200 pt-6"
      >
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Description</h2>
        <p className="leading-relaxed text-gray-600">{product.description}</p>
      </motion.div>

      {/* Variants Selection */}
      {product.variants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-t border-gray-200 pt-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Select Size</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Default option */}
            <button
              onClick={() => onVariantSelect(null)}
              className={`relative rounded-lg border p-4 text-center transition-all duration-200 ${
                !selectedVariant
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">Default</div>
              <div className="mt-1 text-sm text-gray-500">
                Stock: {product.variants.length > 0
                  ? product.variants.reduce((total, variant) => total + variant.stock, 0)
                  : product.stock}
              </div>
              <div className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</div>
              {!selectedVariant && (
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-600"></div>
              )}
            </button>

            {/* Variant options */}
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onVariantSelect(variant)}
                disabled={variant.stock === 0}
                className={`relative rounded-lg border p-4 text-center transition-all duration-200 ${
                  selectedVariant?.id === variant.id
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : variant.stock === 0
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="font-medium">{variant.name}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {variant.stock === 0 ? "Out of Stock" : `Stock: ${variant.stock}`}
                </div>
                <div className="mt-1 text-sm font-semibold">{formatPrice(variant.price)}</div>
                {selectedVariant?.id === variant.id && (
                  <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-600"></div>
                )}
                {variant.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100/50">
                    <span className="text-xs font-medium text-gray-500">Sold Out</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Product Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border-t border-gray-200 pt-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
            <TruckIcon className="h-6 w-6 text-primary-600" />
            <div>
              <div className="text-sm font-medium">Free Shipping</div>
              <div className="text-xs text-gray-500">On orders over $50</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
            <ArrowPathIcon className="h-6 w-6 text-primary-600" />
            <div>
              <div className="text-sm font-medium">Easy Returns</div>
              <div className="text-xs text-gray-500">30-day return policy</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
            <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
            <div>
              <div className="text-sm font-medium">Quality Guarantee</div>
              <div className="text-xs text-gray-500">Premium materials</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
