"use client";

import React from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import { formatPrice } from "@/constants";

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  variants: any[];
}

export default function ShopClient({ products }: { products: Product[] }) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative aspect-w-3 aspect-h-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 mt-2">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
