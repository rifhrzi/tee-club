'use client';

import React, { useEffect, useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

export default function SimpleOrdersPage() {
  const { isAuthenticated, user, token } = useSimpleAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user || !token) {
      console.log('SimpleOrders: Not authenticated or missing token, redirecting to login');
      window.location.href = '/simple-login?redirect=/simple-orders';
      return;
    }

    console.log('SimpleOrders: User is authenticated:', user.email);

    // Fetch orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('SimpleOrders: Fetching orders with token:', token ? 'present' : 'not present');

        // Send the token in the Authorization header
        const response = await fetch('/api/orders', {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });

        if (!response.ok) {
          // Try to get the error message from the response
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch orders: ${response.status}`);
          } catch (jsonError) {
            // If we can't parse the JSON, just use the status code
            throw new Error(`Failed to fetch orders: ${response.status}`);
          }
        }

        const data = await response.json();
        console.log('SimpleOrders: Received orders data');
        setOrders(data.orders || []);
      } catch (error) {
        console.error('SimpleOrders: Error fetching orders:', error);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, token]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Orders (Simple Auth)</h1>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">You don't have any orders yet.</p>
            <Link href="/shop">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p>You have {orders.length} orders.</p>
            <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(orders, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
