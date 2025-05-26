"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import useCartStore from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { redirectToSignup } from "@/utils/authRedirect";
import { useLoading } from "@/contexts/LoadingContext";
import AuthDebugger from "@/components/AuthDebugger";
import { formatPrice } from "@/constants";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import PurchaseControls from "@/components/product/PurchaseControls";
import Breadcrumb from "@/components/product/Breadcrumb";
import RelatedProducts from "@/components/product/RelatedProducts";
import { ProductDetailSkeleton } from "@/components/skeleton";

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
  const isAuthenticated = status === "authenticated";
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { startLoading, stopLoading } = useLoading();

  // Initialize cart store
  useEffect(() => {
    setIsHydrated(true);
    if (!initialized) {
      initializeStore();
    }
  }, [initialized, initializeStore]);

  // Handle page loading state
  useEffect(() => {
    if (product) {
      // Simulate loading time for better UX
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [product]);

  // Log authentication status on mount and when it changes
  useEffect(() => {
    console.log("ProductClient: Authentication status changed", {
      status,
      isAuthenticated,
      sessionExists: !!session,
    });

    // Debug NextAuth session
    if (typeof window !== "undefined") {
      console.log("ProductClient: Checking cookies for NextAuth session");
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const trimmed = cookie.trim();
        if (trimmed.includes("next-auth")) {
          console.log("ProductClient: Found NextAuth cookie:", trimmed);
        }
      });
    }
  }, [status, isAuthenticated, session]);

  // Show skeleton loading while page is loading
  if (isPageLoading && product) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    );
  }

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

  const handleAddToCart = async () => {
    if (status === "loading" || isLoading) return;

    if (!isAuthenticated) {
      startLoading("Redirecting to login...");
      redirectToSignup(window.location.pathname);
      return;
    }

    setIsLoading(true);

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

      // Add to cart
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProduct, {
          currentPath: window.location.pathname,
          skipAuthCheck: true,
        });
      }

      setToastMessage(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToastMessage("Failed to add to cart");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (status === "loading" || isLoading) return;

    if (!isAuthenticated) {
      startLoading("Redirecting to login...");
      redirectToSignup("/cart");
      return;
    }

    setIsLoading(true);

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

      // Add to cart
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProduct, {
          currentPath: "/cart",
          skipAuthCheck: true,
        });
      }

      // Navigate to cart
      router.push("/cart");
    } catch (error) {
      console.error("Error with Buy Now:", error);
      setToastMessage("Failed to process Buy Now");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes("Failed") ? "error" : "success"}
        />
      )}
      <AuthDebugger />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: product.name }]} />

          {/* Main Product Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-8">
              {/* Product Images */}
              <div>
                <ProductImageGallery images={product.images} productName={product.name} />
              </div>

              {/* Product Information */}
              <div className="space-y-8">
                <ProductInfo
                  product={product}
                  selectedVariant={selectedVariant}
                  onVariantSelect={setSelectedVariant}
                />

                <PurchaseControls
                  product={product}
                  selectedVariant={selectedVariant}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  isLoading={isLoading}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </motion.div>

          {/* Related Products */}
          <RelatedProducts currentProductId={product.id} />
        </div>
      </div>
    </Layout>
  );
}
