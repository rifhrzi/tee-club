"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const orderId = searchParams.get('order_id');
  const transactionStatus = searchParams.get('transaction_status');

  // Clear the cart when payment is successful
  useEffect(() => {
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      clearCart();
    }
  }, [transactionStatus, clearCart]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been successfully processed.
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
