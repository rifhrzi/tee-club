'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/constants';

interface OrderSummaryCardProps {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

export default function OrderSummaryCard({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total,
  paymentMethod,
  paymentStatus,
}: OrderSummaryCardProps) {
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method: string) => {
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
      </div>

      {/* Summary Details */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-medium text-gray-900">{formatPrice(subtotal)}</span>
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Discount</span>
              <span className="text-sm font-medium text-green-600">-{formatPrice(discount)}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Shipping</span>
            <span className="text-sm font-medium text-gray-900">
              {shipping === 0 ? 'Free' : formatPrice(shipping)}
            </span>
          </div>

          {/* Tax */}
          {tax > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm font-medium text-gray-900">{formatPrice(tax)}</span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Payment Method</span>
            <span className="text-sm text-gray-900">{formatPaymentMethod(paymentMethod)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Payment Status</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                paymentStatus
              )}`}
            >
              {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Need Help?</h4>
            <p className="text-xs text-blue-800 mt-1">
              Contact our support team if you have any questions about your order or payment.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
