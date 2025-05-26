"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import LoadingButton from "@/components/LoadingButton";
import { QuantitySelector } from "@/components/product/StockStatus";
import {
  ShoppingCartIcon,
  BoltIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

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

interface PurchaseControlsProps {
  product: Product;
  selectedVariant: Variant | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export default function PurchaseControls({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  isLoading,
  isAuthenticated,
}: PurchaseControlsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const maxQuantity = Math.min(currentStock, 10); // Limit to 10 items max
  const isOutOfStock = currentStock === 0;

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareOptions = [
    {
      name: "Copy Link",
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setShowShareMenu(false);
        // You could add a toast notification here
      },
    },
    {
      name: "Facebook",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        setShowShareMenu(false);
      },
    },
    {
      name: "Twitter",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            shareUrl
          )}&text=${encodeURIComponent(product.name)}`,
          "_blank"
        );
        setShowShareMenu(false);
      },
    },
    {
      name: "WhatsApp",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `Check out this product: ${product.name} ${shareUrl}`
          )}`,
          "_blank"
        );
        setShowShareMenu(false);
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6 border-t border-gray-200 pt-6"
    >
      {/* Quantity Selector */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-900">Quantity</label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              onClick={handleQuantityDecrease}
              disabled={quantity <= 1 || isOutOfStock}
              className="rounded-l-lg p-3 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MinusIcon className="h-4 w-4" />
            </button>

            <div className="min-w-[60px] border-x border-gray-300 px-4 py-3 text-center">
              <span className="text-lg font-medium">{quantity}</span>
            </div>

            <button
              onClick={handleQuantityIncrease}
              disabled={quantity >= maxQuantity || isOutOfStock}
              className="rounded-r-lg p-3 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {isOutOfStock ? (
              <span className="font-medium text-red-600">Out of stock</span>
            ) : (
              <span>{currentStock} available</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart Button */}
        <LoadingButton
          onClick={onAddToCart}
          isLoading={isLoading}
          disabled={isOutOfStock || !isAuthenticated}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          loadingText="Adding to Cart..."
        >
          <ShoppingCartIcon className="h-5 w-5" />
          <span>
            {isOutOfStock
              ? "Out of Stock"
              : !isAuthenticated
                ? "Sign In to Add to Cart"
                : "Add to Cart"}
          </span>
        </LoadingButton>

        {/* Buy Now Button */}
        <LoadingButton
          onClick={onBuyNow}
          isLoading={isLoading}
          disabled={isOutOfStock || !isAuthenticated}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-900 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          loadingText="Processing..."
        >
          <BoltIcon className="h-5 w-5" />
          <span>
            {isOutOfStock ? "Unavailable" : !isAuthenticated ? "Sign In to Buy Now" : "Buy Now"}
          </span>
        </LoadingButton>
      </div>

      {/* Share Button */}
      <div className="relative">
        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
        >
          <ShareIcon className="h-5 w-5" />
          <span>Share Product</span>
        </button>

        {/* Share Menu */}
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 z-10 mb-2 rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {shareOptions.map((option, index) => (
              <button
                key={option.name}
                onClick={option.action}
                className={`w-full px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 ${
                  index === 0 ? "rounded-t-lg" : ""
                } ${
                  index === shareOptions.length - 1 ? "rounded-b-lg" : "border-b border-gray-100"
                }`}
              >
                {option.name}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Security and Trust Indicators */}
      <div className="space-y-2 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>Free shipping on orders over $50</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>30-day money-back guarantee</span>
        </div>
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <p className="text-sm text-blue-800">
            <span className="font-medium">Sign in required:</span> Please sign in to add items to
            your cart or make a purchase.
          </p>
        </motion.div>
      )}

      {/* Stock Warning */}
      {currentStock > 0 && currentStock <= 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
        >
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Limited stock:</span> Only {currentStock} items left in
            stock!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
