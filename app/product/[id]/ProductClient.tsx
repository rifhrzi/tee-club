"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { formatPrice } from "@/constants";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { redirectToSignup } from "@/utils/authRedirect";
import { useLoading } from "@/contexts/LoadingContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import LoadingButton from "@/components/LoadingButton";
import AuthDebugger from "@/components/AuthDebugger";

const Layout = dynamic(() => import("@/components/Layout"), { ssr: false });

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  variants: Variant[];
}

export default function ProductClient({ product }: { product: Product | null }) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const initialized = useCartStore((state) => state.initialized);
  const initializeStore = useCartStore((state) => state.initializeStore);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  // Initialize cart store
  useEffect(() => {
    setIsHydrated(true);
    if (!initialized) {
      initializeStore();
    }
  }, [initialized, initializeStore]);

  // Log authentication status on mount and when it changes
  useEffect(() => {
    console.log('ProductClient: Authentication status changed', {
      status,
      isAuthenticated,
      sessionExists: !!session
    });

    // Debug NextAuth session
    if (typeof window !== 'undefined') {
      console.log('ProductClient: Checking cookies for NextAuth session');
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const trimmed = cookie.trim();
        if (trimmed.includes('next-auth')) {
          console.log('ProductClient: Found NextAuth cookie:', trimmed);
        }
      });
    }
  }, [status, isAuthenticated, session]);

  if (!product) {
    return (
      <Layout>
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Product Not Found</h1>
          <Link href="/shop">
            <button className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700">
              Back to Shop
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    // Enhanced debugging for authentication state
    console.log('ProductClient: handleAddToCart called');
    console.log('ProductClient: Authentication state:', {
      status,
      isAuthenticated,
      sessionExists: !!session,
      userEmail: session?.user?.email || 'none'
    });

    // Don't proceed if session is still loading
    if (status === 'loading') {
      console.log('ProductClient: Session still loading, please wait...');
      return;
    }

    // Debug cookies
    if (typeof window !== 'undefined') {
      console.log('ProductClient: Current cookies:', document.cookie);
    }

    if (!isAuthenticated) {
      console.log('ProductClient: User not authenticated, redirecting to signup');
      startLoading('Redirecting to login...');
      redirectToSignup(window.location.pathname);
      return;
    }

    console.log('ProductClient: User is authenticated, adding to cart');

    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: selectedVariant ? selectedVariant.price : product.price,
        description: product.description,
        stock: selectedVariant ? selectedVariant.stock : product.stock,
        images: product.images,
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              name: selectedVariant.name,
              price: selectedVariant.price,
              stock: selectedVariant.stock,
              productId: product.id,
            }
          : undefined,
        variantId: selectedVariant ? selectedVariant.id : undefined,
      };

      // Add to cart (skip auth check since we already verified authentication)
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProduct, {
          currentPath: window.location.pathname,
          skipAuthCheck: true
        });
      }

      setToastMessage(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastMessage("Failed to add to cart");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleBuyNow = () => {
    // Enhanced debugging for authentication state
    console.log('ProductClient: handleBuyNow called');
    console.log('ProductClient: Authentication state:', {
      status,
      isAuthenticated,
      sessionExists: !!session,
      userEmail: session?.user?.email || 'none'
    });

    // Don't proceed if session is still loading
    if (status === 'loading') {
      console.log('ProductClient: Session still loading, please wait...');
      return;
    }

    if (!isAuthenticated) {
      console.log('ProductClient: User not authenticated, redirecting to signup from Buy Now');
      startLoading('Redirecting to login...');
      redirectToSignup('/cart');
      return;
    }

    console.log('ProductClient: User is authenticated, proceeding with Buy Now');

    try {
      // Instead of calling handleAddToCart which might trigger another auth check,
      // let's implement the same logic here with skipAuthCheck set to true
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: selectedVariant ? selectedVariant.price : product.price,
        description: product.description,
        stock: selectedVariant ? selectedVariant.stock : product.stock,
        images: product.images,
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              name: selectedVariant.name,
              price: selectedVariant.price,
              stock: selectedVariant.stock,
              productId: product.id,
            }
          : undefined,
        variantId: selectedVariant ? selectedVariant.id : undefined,
      };

      // Add to cart (skip auth check since we already verified authentication)
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProduct, {
          currentPath: '/cart',
          skipAuthCheck: true
        });
      }

      // Navigate to cart
      router.push("/cart");
    } catch (error) {
      console.error('Error with Buy Now:', error);
      setToastMessage("Failed to process Buy Now");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <Layout>
      {showToast && <Toast message={toastMessage} type={toastMessage.includes("Failed") ? "error" : "success"} />}
      <AuthDebugger />

      <div className="rounded-lg bg-white shadow-lg">
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
          <div className="relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-[500px] w-full rounded-lg object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Product Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {product.variants.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Select Variant</h2>
                <div className="grid grid-cols-2 gap-4">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                        selectedVariant?.id === variant.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <p className="font-medium">{variant.name}</p>
                      <p className="text-sm text-gray-500">Stock: {variant.stock}</p>
                      <p className="mt-2 font-bold">{formatPrice(variant.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quantity</h2>
              <div className="flex items-center space-x-4">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <span className="text-xl">-</span>
                </button>
                <span className="text-xl font-medium">{quantity}</span>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300"
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        selectedVariant ? selectedVariant.stock : product.stock,
                        quantity + 1
                      )
                    )
                  }
                >
                  <span className="text-xl">+</span>
                </button>
              </div>
            </div>

            <div className="flex space-x-4 border-t border-gray-200 pt-6">
              <LoadingButton
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddToCart}
                isLoading={false}
                loadingText="Adding..."
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Checking auth...' : 'Add to Cart'}
              </LoadingButton>
              <LoadingButton
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleBuyNow}
                isLoading={false}
                loadingText="Processing..."
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Checking auth...' : 'Buy Now'}
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}