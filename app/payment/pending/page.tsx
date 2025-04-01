"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('order_id');

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Pending
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment is being processed. Please complete the payment according to the instructions provided.
            {orderId && (
              <span className="block mt-2">
                Order ID: <span className="font-medium">{orderId}</span>
              </span>
            )}
          </p>

          <div className="flex flex-col space-y-4">
            <Link href="/shop">
              <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
