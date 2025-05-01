"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  // Add state variables for client-side rendering
  const [isClient, setIsClient] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // First useEffect to handle client-side initialization
  useEffect(() => {
    setIsClient(true);
    setIsLoading(true);

    try {
      // Get order ID and transaction status from URL parameters
      const urlOrderId = searchParams.get('order_id');
      const urlTransactionStatus = searchParams.get('transaction_status');

      console.log('Payment success page - URL params:', {
        orderId: urlOrderId,
        transactionStatus: urlTransactionStatus
      });

      // Get order ID from localStorage if not in URL
      let finalOrderId = urlOrderId;
      if (!finalOrderId && typeof window !== 'undefined') {
        finalOrderId = localStorage.getItem('pending_order_id');
        console.log('Payment success page - Using order ID from localStorage:', finalOrderId);
      }

      // Set state variables
      setOrderId(finalOrderId);
      setTransactionStatus(urlTransactionStatus);
    } catch (err) {
      console.error('Payment success page - Error initializing:', err);
      setError('Failed to initialize payment success page');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Second useEffect to handle payment success and cleanup
  useEffect(() => {
    // Only run on client side and when we have an order ID
    if (!isClient || !orderId) return;

    try {
      console.log('Payment success page - Processing order:', orderId);
      console.log('Payment success page - Transaction status:', transactionStatus);

      // Clear the cart if transaction status indicates success or if we have an order ID from localStorage
      if (transactionStatus === 'settlement' ||
          transactionStatus === 'capture' ||
          localStorage.getItem('pending_order_id')) {

        console.log('Payment success page - Clearing cart');
        clearCart();

        // Clear the pending order ID from localStorage
        localStorage.removeItem('pending_order_id');

        // Clear the payment authentication token
        localStorage.removeItem('payment_auth_token');
        console.log('Payment success page - Cleared payment auth token');
      }
    } catch (err) {
      console.error('Payment success page - Error processing payment:', err);
      setError('Failed to process payment confirmation');
    }
  }, [isClient, orderId, transactionStatus, clearCart]);

  // Don't render anything until client-side rendering is ready
  if (!isClient) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 text-center">
        {isLoading ? (
          // Loading state
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-600 mt-4">Verifying your payment...</p>
          </div>
        ) : error ? (
          // Error state
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
              Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">{error}</p>

            <div className="flex flex-col space-y-4">
              <Link href="/shop">
                <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
                  Return to Shop
                </button>
              </Link>
            </div>
          </div>
        ) : (
          // Success state
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
              <button
                onClick={() => {
                  // Ensure the order ID is stored before navigating
                  if (orderId) {
                    // Store with a timestamp to ensure it's fresh
                    const orderData = {
                      id: orderId,
                      timestamp: Date.now()
                    };
                    localStorage.setItem('pending_order_id', orderId);
                    localStorage.setItem('pending_order_data', JSON.stringify(orderData));
                    console.log('Payment success - Stored order data for orders page:', orderData);
                  }
                  // Use relative URL to ensure it works on any port
                  const baseUrl = window.location.origin;
                  const ordersUrl = `${baseUrl}/orders`;
                  console.log('Payment success - Redirecting to:', ordersUrl);

                  // Add a small delay to ensure the console log is visible
                  setTimeout(() => {
                    window.location.href = ordersUrl;
                  }, 100);
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 mb-2"
              >
                View My Order
              </button>
              <button
                onClick={() => {
                  const baseUrl = window.location.origin;
                  const shopUrl = `${baseUrl}/shop`;
                  console.log('Payment success - Redirecting to shop:', shopUrl);
                  window.location.href = shopUrl;
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
