"use client";

// app/cart/page.tsx
import React, { useState, useEffect } from "react";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import { formatPrice } from "@/constants";
import dynamicImport from "next/dynamic";
import DirectLoginLink from "@/components/DirectLoginLink";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import AuthDebugger from "@/components/AuthDebugger";
import { useAuthSync } from "@/hooks/useAuthSync";

const Layout = dynamicImport(() => import("@/components/Layout"), { ssr: false });

export const dynamic = "force-dynamic";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isAuthenticated, isReady, isLoading: authLoading } = useAuthSync();
  // Add state to handle hydration and initialization
  const [isHydrated, setIsHydrated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  // Use the cart store
  const cart = useCartStore((state) => state.cart);
  const initialized = useCartStore((state) => state.initialized);
  const initializeStore = useCartStore((state) => state.initializeStore);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Set hydrated state and initialize store once the component mounts
  useEffect(() => {
    setIsHydrated(true);
    setIsClient(true);

    // Initialize the store if it hasn't been initialized yet
    if (!initialized) {
      initializeStore();
    }
  }, [initialized, initializeStore]);

  // Check authentication status using the synchronized hook
  useEffect(() => {
    if (!isClient || !isReady) return;

    // Debug authentication state
    console.log('Cart page - Auth state:', {
      status,
      isAuthenticated,
      authLoading,
      isReady,
      user: session?.user ? session.user.email : 'not logged in'
    });

    // Only redirect if we're definitely not authenticated and the auth state is ready
    if (!isAuthenticated && isReady && !authLoading) {
      console.log('Cart page requires authentication, redirecting to login');
      startLoading('Redirecting to login...');
      router.push('/login?redirect=/cart');
    }
  }, [isAuthenticated, isReady, authLoading, session, router, isClient, startLoading]);

  // Cleanup loading state when component unmounts
  useEffect(() => {
    return () => {
      // Clear loading state when component unmounts (e.g., when navigating away)
      stopLoading();
      setIsNavigating(false);
    };
  }, [stopLoading]);

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Show loading or authentication state
  if (!isHydrated || authLoading || !isReady) {
    return (
      <Layout>
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <LoadingSpinner
                size="medium"
                text={
                  !isHydrated ? "Memuat keranjang belanja..." :
                  authLoading ? "Memeriksa status login..." :
                  "Memuat..."
                }
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated && isReady) {
    return (
      <Layout>
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
          <div className="py-8 text-center">
            <p className="mb-6 text-gray-600">Anda harus login untuk mengakses keranjang belanja.</p>
            <Link href={`/login?redirect=/cart`}>
              <button className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700">
                Login
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
        {cart.length === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-6 text-gray-600">Keranjang belanja Anda kosong.</p>
            <Link href="/">
              <button className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700">
                Lanjut Berbelanja
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.product.id} className="flex items-center justify-between py-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                    <div className="mt-1 space-y-1 text-sm text-gray-500">
                      {item.product.variant && (
                        <p>
                          Variant: {item.product.variant ? item.product.variant.name : "No variant"}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-gray-600">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <label htmlFor={`quantity-${item.product.id}`} className="sr-only">
                        Quantity
                      </label>
                      <input
                        id={`quantity-${item.product.id}`}
                        name={`quantity-${item.product.id}`}
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                        className="w-20 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        aria-label="Product quantity"
                      />
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="font-medium text-red-600 hover:text-red-800"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={clearCart}
                  className="rounded-md bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition duration-300 hover:bg-gray-300"
                >
                  Kosongkan Keranjang
                </button>
                <DirectLoginLink
                  className="inline-block"
                  onNavigationStart={() => {
                    setIsNavigating(true);
                    startLoading('Menuju ke halaman pembayaran...');
                  }}
                  onNavigationComplete={() => {
                    setIsNavigating(false);
                    stopLoading();
                  }}
                >
                  <button
                    className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700 disabled:opacity-50"
                    disabled={isNavigating}
                  >
                    {isNavigating ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                  </button>
                </DirectLoginLink>
              </div>
            </div>
          </div>
        )}
      </div>
      <AuthDebugger />
    </Layout>
  );
}
