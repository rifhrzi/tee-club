'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/constants';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  variant?: {
    id: string;
    name: string;
  };
}

interface OrderItemCardProps {
  item: OrderItem;
  index: number;
}

export default function OrderItemCard({ item, index }: OrderItemCardProps) {
  const itemTotal = item.price * item.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            {item.product.images && item.product.images.length > 0 ? (
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                sizes="80px"
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                href={`/product/${item.product.id}`}
                className="block group-hover:text-primary-600 transition-colors duration-200"
              >
                <h4 className="text-lg font-medium text-gray-900 line-clamp-2">
                  {item.product.name}
                </h4>
              </Link>
              
              {item.variant && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.variant.name}
                  </span>
                </div>
              )}
              
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Qty:</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-900">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Unit Price:</span>
                  <span className="text-gray-900">{formatPrice(item.price)}</span>
                </div>
              </div>
            </div>

            {/* Item Total */}
            <div className="text-right ml-4">
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(itemTotal)}
              </div>
              <div className="text-sm text-gray-500">
                Total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <Link
            href={`/product/${item.product.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
          >
            View Product Details
          </Link>
          
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
          >
            Buy Again
          </button>
        </div>
      </div>
    </motion.div>
  );
}
