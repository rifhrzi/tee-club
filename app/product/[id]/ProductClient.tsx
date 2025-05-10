"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { formatPrice } from "@/constants";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { redirectToSignup } from "@/utils/authRedirect";

// Import Layout with dynamic import to avoid hydration issues
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
  const { isAuthenticated } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Set hydrated state and initialize store once the component mounts
  useEffect(() => {
    setIsHydrated(true);

    // Initialize the store if it hasn't been initialized yet
    if (!initialized) {
      initializeStore();
    }
  }, [initialized, initializeStore]);

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
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to signup page
      redirectToSignup(window.location.pathname);
      return;
    }

    // Create a product object that matches the expected structure in the cart store
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

    // Add the product to the cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      // Use skipAuthCheck since we already checked authentication
      addToCart(cartProduct, { skipAuthCheck: true });
    }

    // Show success toast
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);

    // Hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to signup page
      redirectToSignup('/checkout');
      return;
    }

    handleAddToCart();
    router.push("/cart");
  };

  return (
    <Layout>
      {showToast && <Toast message={toastMessage} type="success" />}

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
              <button
                className="flex-1 rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                className="flex-1 rounded-md bg-green-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-green-700"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
