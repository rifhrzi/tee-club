"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useCartStore from '@/store/cartStore';
import useAuth from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
import * as ls from '@/utils/localStorage';
import { syncAuthState, isAuthenticated } from '@/utils/authSync';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

export default function Checkout() {
  const router = useRouter();
  const cart = useCartStore(state => state.cart);
  const { data: session, status } = useSession();
  const { token: accessToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Form data state for restoration after login
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Set isClient to true when component mounts and restore form data if available
  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      // Clear redirect tracking
      localStorage.removeItem('checkout_redirect_attempts');
      localStorage.removeItem('login_redirect');

      // Check for stored form data
      const storedFormData = localStorage.getItem('checkout_form_data');
      if (storedFormData) {
        try {
          const parsedData = JSON.parse(storedFormData);
          console.log('Found stored checkout form data, restoring fields');
          setFormData(parsedData);

          // Remove the stored data after restoring
          localStorage.removeItem('checkout_form_data');
        } catch (error) {
          console.error('Error parsing stored checkout form data:', error);
          localStorage.removeItem('checkout_form_data');
        }
      }
    }
  }, []);

  // Sync authentication state between NextAuth and custom auth
  const authState = syncAuthState(session, status);

  // Check authentication status
  useEffect(() => {
    if (!isClient) return;

    // Debug authentication state
    console.log('Checkout page - Auth state:', {
      nextAuthStatus: status,
      nextAuthSession: !!session,
      nextAuthUser: session?.user?.email,
      customAuthToken: !!accessToken,
      customAuthUser: user?.email,
      nextAuthAuthenticated: ls.isNextAuthAuthenticated(),
      syncedAuthState: authState
    });

    // Log all cookies for debugging
    if (typeof document !== 'undefined') {
      console.log('Checkout page - Cookies:');
      document.cookie.split(';').forEach(cookie => {
        console.log('  ', cookie.trim());
      });
    }

    // Check if user is authenticated with either system
    if (!authState.isAuthenticated) {
      console.log('Checkout requires authentication, redirecting to login');
      router.push('/login?redirect=/checkout');
    } else {
      console.log('User is authenticated:',
        authState.user?.email, 'via', authState.authSource);
    }
  }, [status, session, accessToken, user, router, isClient, authState]);

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission which would cause a page refresh
    event.preventDefault();

    console.log('Checkout form submitted, preventing default page refresh');
    setLoading(true);
    setError('');

    try {
      if (cart.length === 0) {
        throw new Error('Your cart is empty. Please add items to your cart before checkout.');
      }

      // Check authentication status again before proceeding
      const isNextAuthAuthenticated = status === 'authenticated' && !!session;
      const isCustomAuthAuthenticated = !!accessToken && !!user;

      // Log detailed authentication state for debugging
      console.log('Checkout - Authentication check before proceeding:', {
        nextAuthStatus: status,
        nextAuthSession: !!session,
        nextAuthUser: session?.user?.email,
        customAuthToken: !!accessToken,
        customAuthUser: user?.email,
        isNextAuthAuthenticated,
        isCustomAuthAuthenticated,
        combinedAuthState: authState
      });

      if (!isNextAuthAuthenticated && !isCustomAuthAuthenticated) {
        console.log('Checkout requires authentication, redirecting to login');
        router.push('/login?redirect=/checkout');
        return;
      }

      // Log which authentication method we're using
      if (isNextAuthAuthenticated) {
        console.log('Proceeding with NextAuth authenticated checkout for:', session?.user?.email);
      } else {
        console.log('Proceeding with custom auth authenticated checkout for:', user?.email);
      }

      const formData = new FormData(event.currentTarget);
      const transformedItems = cart.map(item => {
        const transformedItem: any = {
          productId: String(item.product.id),
          quantity: item.quantity
        };
        const product = item.product as any;
        if (product.variantId) {
          transformedItem.variantId = product.variantId;
        }
        return transformedItem;
      });

      const phoneInput = formData.get('phone') as string;
      const formattedPhone = phoneInput.startsWith('0')
        ? phoneInput
        : phoneInput.startsWith('+62')
          ? phoneInput.replace('+62', '0')
          : phoneInput.startsWith('62')
            ? phoneInput.replace('62', '0')
            : `0${phoneInput}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header - prefer NextAuth session if available
      if (isNextAuthAuthenticated && session) {
        // For NextAuth, we need to get the session token from cookies
        // The API middleware will handle this
        console.log('Using NextAuth session for authorization');

        // Store the user ID in a custom header for debugging
        if (session.user?.id) {
          headers['X-NextAuth-User-ID'] = session.user.id;
        }
      } else if (accessToken) {
        // Fall back to custom auth token if available
        console.log('Using custom auth token for authorization');
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      console.log('Sending checkout request with items:', transformedItems.length);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: transformedItems,
          shippingDetails: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formattedPhone,
            address: formData.get('address'),
            city: formData.get('city'),
            postalCode: formData.get('postalCode'),
          },
        }),
      });

      console.log('Checkout API response status:', response.status);
      const data = await response.json();
      console.log('Checkout API response data:', data);

      if (!response.ok) {
        console.log('Checkout API error response:', {
          status: response.status,
          data
        });

        if (response.status === 401) {
          console.log('Authentication error during checkout, redirecting to login');

          // Store checkout data in localStorage to restore after login
          if (typeof window !== 'undefined') {
            localStorage.setItem('checkout_form_data', JSON.stringify({
              name: formData.get('name'),
              email: formData.get('email'),
              phone: formData.get('phone'),
              address: formData.get('address'),
              city: formData.get('city'),
              postalCode: formData.get('postalCode'),
              timestamp: new Date().toISOString()
            }));
            console.log('Stored checkout form data for restoration after login');
          }

          // Redirect to login with checkout as the redirect destination
          router.push('/login?redirect=/checkout');
          return;
        }

        if (response.status === 400 && data.details) {
          const validationErrors = data.details.map((error: any) => {
            const path = error.path.join('.');
            return `${path}: ${error.message}`;
          }).join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }

        throw new Error(data.error || data.message || 'Checkout failed');
      }

      if (typeof window !== 'undefined') {
        // Store order information
        if (data.orderId) {
          localStorage.setItem('pending_order_id', data.orderId);
          console.log('Stored pending order ID:', data.orderId);
        }

        // Store authentication information for payment
        if (accessToken) {
          localStorage.setItem('payment_auth_token', accessToken);
          console.log('Stored custom auth token for payment');
        }

        // Store NextAuth session information if available
        if (status === 'authenticated' && session) {
          localStorage.setItem('nextauth_checkout_session', JSON.stringify({
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name
            },
            timestamp: new Date().toISOString()
          }));
          console.log('Stored NextAuth session info for payment return');
        }

        // Store the return URL
        localStorage.setItem('checkout_return_url', window.location.href);
      }

      // Log the redirect
      console.log('Redirecting to payment gateway:', data.redirectUrl);

      // Use window.location for external redirects
      // This is necessary for Midtrans payment gateway
      // We've stored auth state above to handle return from payment
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                defaultValue={formData.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                defaultValue={formData.email}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                placeholder="08123456789"
                defaultValue={formData.phone}
                pattern="(\+62|62|0)8[1-9][0-9]{6,9}"
                title="Enter a valid Indonesian phone number (e.g., 08123456789, +628123456789, or 628123456789)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Format: 08XXXXXXXXX, +628XXXXXXXXX, or 628XXXXXXXXX</p>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                id="address"
                required
                rows={3}
                defaultValue={formData.address}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                id="city"
                required
                defaultValue={formData.city}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                required
                placeholder="12345"
                defaultValue={formData.postalCode}
                pattern="\d{5}"
                title="Postal code must be 5 digits"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Enter a 5-digit postal code</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}