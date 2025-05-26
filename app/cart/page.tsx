"use client";

// app/cart/page.tsx
import React, { useState, useEffect } from "react";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import { formatPrice } from "@/constants";
import dynamicImport from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import LoadingSpinner from "@/components/LoadingSpinner";
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
    console.log("Cart page - Auth state:", {
      status,
      isAuthenticated,
      authLoading,
      isReady,
      user: session?.user ? session.user.email : "not logged in",
    });

    // Only redirect if we're definitely not authenticated and the auth state is ready
    if (!isAuthenticated && isReady && !authLoading) {
      console.log("Cart page requires authentication, redirecting to login");
      startLoading("Redirecting to login...");
      router.push("/login?redirect=/cart");
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
        <div className="bg-grunge-dark bg-noise min-h-screen">
          <div className="container mx-auto px-4 py-12">
            <div className="card-grunge p-8">
              <h1 className="font-grunge text-band-white mb-8 text-4xl uppercase">
                YOUR <span className="text-neon">STASH</span>
              </h1>
              <div className="py-8 text-center">
                <div className="mb-4 flex justify-center">
                  <LoadingSpinner
                    size="medium"
                    text={
                      !isHydrated
                        ? "Loading your underground stash..."
                        : authLoading
                          ? "Checking rebel status..."
                          : "Loading..."
                    }
                  />
                </div>
              </div>
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
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="card mx-auto max-w-md p-8">
              <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <div className="py-8 text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <p className="mb-2 text-xl font-semibold text-gray-900">Sign in required</p>
                  <p className="text-gray-600">Please sign in to access your shopping cart</p>
                </div>
                <Link href={`/login?redirect=/cart`}>
                  <button className="btn btn-primary">Sign In</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="card p-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">Shopping Cart</h1>
            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-8">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <p className="mb-6 text-xl font-semibold text-gray-900">Your cart is empty</p>
                <p className="mb-8 text-gray-600">Start shopping to add items to your cart</p>
                <Link href="/shop">
                  <button className="btn btn-primary">Start Shopping</button>
                </Link>
              </div>
            ) : (
              <div>
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="card flex items-center justify-between p-6"
                    >
                      <div className="flex flex-1 items-center space-x-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                          <svg
                            className="h-8 w-8 text-primary-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-semibold text-gray-900">
                            {item.product.name}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            {item.product.variant && (
                              <p>
                                Variant:{" "}
                                {item.product.variant ? item.product.variant.name : "No variant"}
                              </p>
                            )}
                          </div>
                          <p className="text-lg font-bold text-primary-600">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          <label
                            htmlFor={`quantity-${item.product.id}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Qty:
                          </label>
                          <input
                            id={`quantity-${item.product.id}`}
                            name={`quantity-${item.product.id}`}
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={(e) =>
                              updateQuantity(item.product.id, parseInt(e.target.value))
                            }
                            className="input w-20 text-center"
                            aria-label="Product quantity"
                          />
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="btn btn-danger"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 border-t border-gray-200 pt-8">
                  <div className="card mb-8 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-semibold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold text-primary-600">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">Free shipping on all orders</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                    <button onClick={clearCart} className="btn btn-secondary">
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
