"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import useCartStore from '@/store/cartStore';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';


// Force this page to be client-side only
export const dynamic = 'force-dynamic';

export default function Checkout() {
  return (
    <AuthGuard
      requireAuth={true}
      redirectTo="/login?redirect=/checkout"
      loadingMessage="Preparing checkout..."
    >
      <CheckoutContent />
    </AuthGuard>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const cart = useCartStore(state => state.cart);
  const { data: session, status } = useSession();
  const user = session?.user;
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

  // Simple auth state logging (AuthGuard handles the heavy lifting)
  useEffect(() => {
    if (!isClient) return;

    console.log('Checkout page - Auth state:', {
      status,
      isAuthenticated: status === 'authenticated',
      userEmail: session?.user?.email || 'not logged in'
    });
  }, [status, isClient, session?.user?.email]);

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
      if (status === 'loading') {
        console.log('Authentication status is still loading, waiting...');
        setLoading(false);
        return;
      }

      if (status !== 'authenticated' || !session || !user) {
        // Log detailed authentication state for debugging
        console.log('Checkout - Authentication check before proceeding:', {
          status,
          isAuthenticated: status === 'authenticated',
          session: !!session,
          user: !!user
        });

        console.log('Checkout requires authentication, redirecting to login');

        // Store checkout data in localStorage to restore after login
        if (typeof window !== 'undefined') {
          const formElement = event.currentTarget as HTMLFormElement;
          const formData = new FormData(formElement);

          localStorage.setItem('checkout_form_data', JSON.stringify({
            name: formData.get('name') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            address: formData.get('address') || '',
            city: formData.get('city') || '',
            postalCode: formData.get('postalCode') || '',
            timestamp: new Date().toISOString()
          }));
          console.log('Stored checkout form data for restoration after login');
        }

        router.push('/login?redirect=/checkout');
        return;
      }

      // Log authentication status
      console.log('Proceeding with authenticated checkout for:', user.email);

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

      // Prepare headers for the API request
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add user ID header for debugging
      // The API middleware will handle authentication via NextAuth session
      console.log('Using NextAuth session for authorization');

      // Store the user ID in a custom header for debugging
      if (user?.id) {
        headers['x-nextauth-user-id-debug'] = user.id;
      }

      // Log all cookies for debugging
      console.log('Checkout page - Cookies before API request:');
      document.cookie.split(';').forEach(cookie => {
        console.log('  ', cookie.trim());
      });

      // Log the session data
      console.log('Checkout page - Session data:', {
        id: session?.user?.id,
        email: session?.user?.email,
        name: session?.user?.name
      });

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
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ... (h1, error display, form inputs as before) ... */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Checkout Details</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow-sm" role="alert">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* AuthGuard handles authentication, so we can directly show the form */}
        {!isClient ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading checkout...</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-6 bg-white p-6 shadow-lg rounded-lg">
          {/* ... (all your form input divs: name, email, phone, address, city, postalCode) ... */}
          {/* For example: */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={formData.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="John Doe"
            />
          </div>
          {/* (Include all other input fields here as they were in the previous full code) */}
           <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              defaultValue={formData.email}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              defaultValue={formData.phone}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="08123456789"
              pattern="(\+62|62|0)8[1-9][0-9]{6,10}"
              title="Enter a valid Indonesian phone number (e.g., 08123456789, +628123456789)."
            />
             <p className="mt-1 text-xs text-gray-500">Format: 08xxxx, +628xxxx, or 628xxxx</p>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
            <textarea
              name="address"
              id="address"
              required
              rows={3}
              defaultValue={formData.address}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="123 Main St, Apartment 4B"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              id="city"
              required
              defaultValue={formData.city}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Jakarta"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              required
              defaultValue={formData.postalCode}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="12345"
              pattern="\d{5}"
              title="Postal code must be 5 digits."
            />
            <p className="mt-1 text-xs text-gray-500">Enter a 5-digit postal code.</p>
          </div>


          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing Order...' : 'Place Order & Proceed to Payment'}
            </button>
          </div>
        </form>
        )}
      </div>
    </Layout>
  );
}