"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { formatPrice } from '@/constants';

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

// Order status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
};

// Order type definition
interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Set client-side rendering flag and check for pending order
  useEffect(() => {
    setIsClient(true);

    // Check for pending order ID in localStorage
    if (typeof window !== 'undefined') {
      const storedOrderId = localStorage.getItem('pending_order_id');
      const storedOrderData = localStorage.getItem('pending_order_data');

      if (storedOrderId) {
        console.log('Orders Page - Found pending order ID in localStorage:', storedOrderId);
        setPendingOrderId(storedOrderId);

        // Check if the order data is still fresh (less than 10 minutes old)
        if (storedOrderData) {
          try {
            const orderData = JSON.parse(storedOrderData);
            const now = Date.now();
            const orderTime = orderData.timestamp || 0;
            const timeDiff = now - orderTime;

            // If the order data is older than 10 minutes, clear it
            if (timeDiff > 10 * 60 * 1000) {
              console.log('Orders Page - Order data is stale, clearing it');
              localStorage.removeItem('pending_order_id');
              localStorage.removeItem('pending_order_data');
              setPendingOrderId(null);
            } else {
              console.log('Orders Page - Order data is fresh, using it');
            }
          } catch (error) {
            console.error('Orders Page - Error parsing order data:', error);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Debug: Log authentication state
    console.log('Orders Page - Auth State:', {
      isLoggedIn: isAuthenticated,
      user: user ? user.email : 'not logged in'
    });

    // For guest users, show a message instead of redirecting
    if (!isAuthenticated && !pendingOrderId) {
      console.log('Orders Page - Not authenticated and no pending order, showing guest message');
      setLoading(false);
      // We'll handle this in the UI instead of redirecting
      return;
    }

    console.log('Orders Page - User is authenticated, proceeding to fetch orders');

    // Fetch orders based on authentication status
    const fetchOrders = async () => {
      try {
        setLoading(true);

        if (isAuthenticated) {
          // Fetch authenticated user's orders
          console.log('Orders Page - Fetching orders for authenticated user');
          const response = await fetch('/api/orders');

          console.log('Orders Page - API response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Orders Page - API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch orders');
          }

          const data = await response.json();
          console.log('Orders Page - Received orders:', data.orders ? data.orders.length : 0);
          setOrders(data.orders || []);
        } else if (pendingOrderId) {
          // Fetch guest order by ID
          console.log('Orders Page - Fetching guest order by ID:', pendingOrderId);

          // Add more debugging
          try {
            const response = await fetch(`/api/orders/guest?orderId=${pendingOrderId}`);
            console.log('Orders Page - Guest API response received');

            // Log the raw response
            const responseText = await response.text();
            console.log('Orders Page - Guest API raw response:', responseText);

            // Parse the response as JSON
            const data = JSON.parse(responseText);
            console.log('Orders Page - Received guest orders:', data.orders ? data.orders.length : 0);
            setOrders(data.orders || []);

            // Clear the pending order ID after fetching
            localStorage.removeItem('pending_order_id');
            localStorage.removeItem('pending_order_data');
          } catch (fetchError: any) { // Type assertion for the error
            console.error('Orders Page - Error in guest order fetch:', fetchError);
            setError(`Failed to fetch guest order: ${fetchError.message || 'Unknown error'}`);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isClient, isAuthenticated, user, router, pendingOrderId]);

  // Don't render anything until client-side rendering is ready
  if (!isClient) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : !isAuthenticated && !pendingOrderId ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-gray-900">Sign in to view your orders</h3>
            <p className="mt-1 text-gray-500 mb-4">
              Please sign in to view your order history or search for a specific order below.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login?redirect=/orders">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/shop">
                <button className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Browse Products
                </button>
              </Link>
            </div>
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
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                  <Link href={`/orders/${order.id}`}>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      View Order Details
                    </button>
                  </Link>
                  {order.status === 'PENDING' && (
                    <Link href={`/payment/${order.id}`}>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Complete Payment
                      </button>
                    </Link>
                  )}
                  {order.status === 'DELIVERED' && (
                    <Link href={`/review/${order.id}`}>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Write Review
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
