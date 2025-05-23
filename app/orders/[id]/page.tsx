"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
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
  paymentMethod: string;
  paymentToken?: string;
  shippingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: {
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
  }[];
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only run on client side
    const isClient = typeof window !== 'undefined';
    if (!isClient) return;

    // Debug authentication state
    console.log('Order Detail Page - Auth state:', {
      status,
      isAuthenticated: status === 'authenticated',
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      } : null
    });

    // Only redirect if we're definitely not authenticated (not during loading)
    if (status === 'unauthenticated') {
      console.log('Order detail page requires authentication, redirecting to login');
      router.push(`/login?redirect=/orders/${params.id}`);
      return;
    }

    if (status === 'loading') {
      console.log('Authentication status is loading, waiting...');
      return;
    }

    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log('Order Detail Page - Fetching order details for ID:', params.id);

        // Prepare headers
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };

        // Add user ID header for debugging
        if (session?.user?.id) {
          headers['x-nextauth-user-id-debug'] = session.user.id;
        }

        // Log all cookies for debugging
        console.log('Order Detail Page - Cookies before API request:');
        document.cookie.split(';').forEach(cookie => {
          console.log('  ', cookie.trim());
        });

        // NextAuth session is automatically included via cookies
        const response = await fetch(`/api/orders/${params.id}`, {
          headers,
          credentials: 'include' // This ensures cookies are sent with the request
        });

        console.log('Order Detail Page - API response status:', response.status);

        if (!response.ok) {
          // Try to parse error response
          try {
            const errorData = await response.json();
            console.error('Order Detail Page - API error:', errorData);
            throw new Error(errorData.message || 'Failed to fetch order details');
          } catch (parseError) {
            console.error('Order Detail Page - Error parsing error response:', parseError);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
        }

        const data = await response.json();
        console.log('Order Detail Page - Order data received successfully');
        setOrder(data.order);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [status, session, router, params.id]);

  // Helper function to get order status text with description
  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          title: 'Payment Pending',
          description: 'Your order has been placed but payment has not been completed.'
        };
      case 'PAID':
        return {
          title: 'Payment Completed',
          description: 'Your payment has been received and your order is being processed.'
        };
      case 'SHIPPED':
        return {
          title: 'Order Shipped',
          description: 'Your order has been shipped and is on its way to you.'
        };
      case 'DELIVERED':
        return {
          title: 'Order Delivered',
          description: 'Your order has been delivered. Enjoy your purchase!'
        };
      case 'CANCELLED':
        return {
          title: 'Order Cancelled',
          description: 'This order has been cancelled.'
        };
      default:
        return {
          title: 'Processing',
          description: 'Your order is being processed.'
        };
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/orders" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Orders
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Order Details</h1>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : !order ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">Order not found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order.id.substring(0, 8)}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {order.status === 'PENDING' ? (
                      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : order.status === 'PAID' ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : order.status === 'SHIPPED' ? (
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                      </svg>
                    ) : order.status === 'DELIVERED' ? (
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{getOrderStatusInfo(order.status).title}</h3>
                    <p className="text-sm text-gray-600">{getOrderStatusInfo(order.status).description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex items-start gap-4">
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
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
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                      )}
                      <div className="mt-1 flex justify-between">
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Recipient</p>
                  <p className="font-medium">{order.shippingDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  <p className="font-medium">{order.shippingDetails.phone}</p>
                  <p className="text-sm">{order.shippingDetails.email}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium">
                    {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <StatusBadge status={order.status === 'PENDING' ? 'PENDING' : 'PAID'} />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium">Free</p>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <p className="font-semibold">Total</p>
                    <p className="font-bold">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 flex flex-wrap gap-4 justify-end">
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
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Print Order
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
