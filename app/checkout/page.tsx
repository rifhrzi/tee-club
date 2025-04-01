"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useCartStore from '@/store/cartStore'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false })

export default function Checkout() {
  const router = useRouter()
  const cart = useCartStore(state => state.cart)
  const { accessToken, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if user is authenticated
  useEffect(() => {
    if (!accessToken || !user) {
      router.push('/login?redirect=/checkout')
    }
  }, [accessToken, user, router])

  const handleCheckout = async (formData: FormData) => {
    try {
      setLoading(true)
      setError('')

      // Check if user is authenticated
      if (!accessToken || !user) {
        router.push('/login?redirect=/checkout')
        return
      }

      // Transform cart items to match the expected API format
      const transformedItems = cart.map(item => {
        // Create the base item with required fields
        const transformedItem: any = {
          productId: String(item.product.id), // Ensure productId is a string
          quantity: item.quantity
        };

        // Only add variantId if it exists
        if (item.product.variantId) {
          transformedItem.variantId = item.product.variantId;
        }

        return transformedItem;
      });

      // Format phone number to match Indonesian format
      const phoneInput = formData.get('phone') as string;
      const formattedPhone = phoneInput.startsWith('0')
        ? phoneInput
        : phoneInput.startsWith('+62')
          ? phoneInput.replace('+62', '0')
          : phoneInput.startsWith('62')
            ? phoneInput.replace('62', '0')
            : `0${phoneInput}`;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
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
          paymentMethod: formData.get('paymentMethod'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized error - redirect to login
          router.push('/login?redirect=/checkout')
          return
        }

        // Handle validation errors
        if (response.status === 400 && data.details) {
          // Format validation errors for display
          const validationErrors = data.details.map((error: any) => {
            // Format the path for better readability
            const path = error.path.join('.');
            return `${path}: ${error.message}`;
          }).join('\n');

          throw new Error(`Validation errors:\n${validationErrors}`);
        }

        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Midtrans payment page
      window.location.href = data.redirectUrl

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

      <form action={handleCheckout}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              required
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
              pattern="\d{5}"
              title="Postal code must be 5 digits"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Enter a 5-digit postal code</p>
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              id="paymentMethod"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="ewallet">E-Wallet</option>
              <option value="cod">Cash on Delivery</option>
            </select>
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
  )
}
