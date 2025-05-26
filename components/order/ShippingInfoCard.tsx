'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface ShippingInfoCardProps {
  shippingDetails: ShippingDetails;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingMethod?: string;
}

export default function ShippingInfoCard({
  shippingDetails,
  trackingNumber,
  estimatedDelivery,
  shippingMethod = 'Standard Shipping',
}: ShippingInfoCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TruckIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Recipient Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Recipient Details
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{shippingDetails.name}</p>
                  <p className="text-xs text-gray-600">Full Name</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{shippingDetails.phone}</p>
                  <p className="text-xs text-gray-600">Phone Number</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{shippingDetails.email}</p>
                  <p className="text-xs text-gray-600">Email Address</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-2" />
              Delivery Address
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {shippingDetails.address}
                  </p>
                  <p className="text-sm text-gray-700">
                    {shippingDetails.city}, {shippingDetails.postalCode}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Delivery Address</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Shipping Method</h4>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TruckIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{shippingMethod}</p>
                  {estimatedDelivery && (
                    <p className="text-xs text-blue-700">
                      Estimated delivery: {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {trackingNumber && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                Tracking Information
              </h4>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Tracking Number</p>
                    <p className="text-sm text-green-700 font-mono">{trackingNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(trackingNumber)}
                    className="text-xs text-green-600 hover:text-green-700 font-medium px-3 py-1 bg-green-100 rounded-md hover:bg-green-200 transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200">
                    Track Package →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Need to update your shipping address? Contact our support team.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
