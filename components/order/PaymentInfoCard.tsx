'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { formatPrice } from '@/constants';

interface PaymentInfoCardProps {
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  transactionId?: string;
  paymentDate?: string;
  billingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export default function PaymentInfoCard({
  paymentMethod,
  paymentStatus,
  totalAmount,
  transactionId,
  paymentDate,
  billingAddress,
}: PaymentInfoCardProps) {
  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank_transfer':
        return BanknotesIcon;
      case 'ewallet':
        return DevicePhoneMobileIcon;
      case 'cod':
        return BanknotesIcon;
      default:
        return CreditCardIcon;
    }
  };

  const getPaymentStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          text: 'Payment Successful',
          description: 'Your payment has been processed successfully',
        };
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          text: 'Payment Pending',
          description: 'Your payment is being processed',
        };
      case 'failed':
      case 'cancelled':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          text: 'Payment Failed',
          description: 'There was an issue with your payment',
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          text: 'Payment Status Unknown',
          description: 'Payment status is being verified',
        };
    }
  };

  const formatPaymentMethod = (method: string) => {
    const methodMap: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      ewallet: 'E-Wallet',
      cod: 'Cash on Delivery',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
    };
    return methodMap[method.toLowerCase()] || method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const PaymentMethodIcon = getPaymentMethodIcon(paymentMethod);
  const statusInfo = getPaymentStatusInfo(paymentStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <CreditCardIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Payment Status */}
          <div className={`rounded-lg p-4 border ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <div>
                <h4 className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </h4>
                <p className={`text-xs ${statusInfo.color} opacity-80 mt-1`}>
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Payment Method</span>
              <div className="flex items-center space-x-2">
                <PaymentMethodIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-900">{formatPaymentMethod(paymentMethod)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Amount Paid</span>
              <span className="text-lg font-semibold text-gray-900">{formatPrice(totalAmount)}</span>
            </div>

            {paymentDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Payment Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(paymentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}

            {transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Transaction ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900 font-mono">{transactionId}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(transactionId)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 bg-primary-50 rounded hover:bg-primary-100 transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Billing Address */}
          {billingAddress && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Billing Address</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{billingAddress.name}</p>
                  <p className="text-sm text-gray-700">{billingAddress.address}</p>
                  <p className="text-sm text-gray-700">
                    {billingAddress.city}, {billingAddress.postalCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Your payment information is secure and encrypted</span>
          </div>
          
          {paymentStatus.toLowerCase() === 'failed' && (
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Retry Payment
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
