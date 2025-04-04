"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { formatPrice } from "@/constants";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import { useRouter } from 'next/navigation';
import Toast from "@/components/Toast";

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

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
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!product) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <Link href="/shop">
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
              Back to Shop
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    // Create a product object that matches the expected structure in the cart store
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      description: product.description,
      stock: selectedVariant ? selectedVariant.stock : product.stock,
      images: product.images,
      variant: selectedVariant ? selectedVariant.name : undefined,
      variantId: selectedVariant ? selectedVariant.id : undefined
    };

    // Add the product to the cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }

    // Show success toast
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);

    // Hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  return (
    <Layout>
      {showToast && <Toast message={toastMessage} type="success" />}

      <div className="bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-[500px] object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Product Description
              </h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {product.variants.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Variant
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${selectedVariant?.id === variant.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <p className="font-medium">{variant.name}</p>
                      <p className="text-sm text-gray-500">
                        Stock: {variant.stock}
                      </p>
                      <p className="font-bold mt-2">
                        {formatPrice(variant.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quantity
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <span className="text-xl">-</span>
                </button>
                <span className="text-xl font-medium">{quantity}</span>
                <button
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={() => setQuantity(Math.min((selectedVariant ? selectedVariant.stock : product.stock), quantity + 1))}
                >
                  <span className="text-xl">+</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex space-x-4">
              <button
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-300"
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
