'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatPrice } from '@/constants';
import QuickAddToCart from '@/components/QuickAddToCart';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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
  viewMode: 'grid' | 'list';
  index: number;
}

export default function ProductCard({ product, viewMode, index }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    } else if (product.stock < 5) {
      return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
    }
  };

  const stockStatus = getStockStatus();

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="flex">
          {/* Image Section */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Link href={`/product/${product.id}`}>
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-l-xl" />
                )}
                <Image
                  src={product.images?.[0] || '/placeholder-image.svg'}
                  alt={product.name}
                  fill
                  sizes="192px"
                  className={`object-cover rounded-l-xl transition-all duration-300 group-hover:scale-105 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-l-xl" />
                
                {/* Quick view button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>

            {/* Stock overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-l-xl">
                <span className="text-white font-semibold text-sm">Out of Stock</span>
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200"
            >
              {isWishlisted ? (
                <HeartSolidIcon className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
              </div>
              
              <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${stockStatus.className}`}>
                {stockStatus.text}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-500 ml-1">(4.5)</span>
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
      className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/product/${product.id}`}>
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <Image
            src={product.images?.[0] || '/placeholder-image.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          
          {/* Quick view button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="bg-white/90 backdrop-blur-sm text-gray-900 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200">
              <EyeIcon className="w-5 h-5" />
            </button>
          </div>
        </Link>

        {/* Stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200"
        >
          {isWishlisted ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Stock status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.className}`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-3">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400"
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
