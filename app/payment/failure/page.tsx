"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('order_id');
  const transactionStatus = searchParams.get('transaction_status');
  const statusMessage = searchParams.get('status_message');

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're sorry, but there was an issue processing your payment.
            {statusMessage && (
              <span className="block mt-2 text-red-600">
                Reason: {statusMessage}
              </span>
            )}
            {orderId && (
              <span className="block mt-2">
                Order ID: <span className="font-medium">{orderId}</span>
              </span>
            )}
          </p>

          <div className="flex flex-col space-y-4">
            <Link href="/cart">
              <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
                Return to Cart
              </button>
            </Link>
            <Link href="/shop">
              <button className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
