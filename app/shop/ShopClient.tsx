"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { formatPrice } from "@/constants";
import QuickAddToCart from "@/components/QuickAddToCart";
import AuthDebugger from "@/components/AuthDebugger";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import("@/components/Layout"), { ssr: false });

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Ensure initial render is consistent
  useEffect(() => {
    console.log("Initial products:", products);
  }, [products]);

  // Filter and sort products (only search and sort, no category/price filters)
  const filteredProducts = products
    .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              Shop <span className="gradient-text">Collection</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover our premium t-shirt collection designed for style and comfort
            </p>
          </div>

          <div className="mb-8 flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-12 pr-4"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center space-x-4">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
                <option value="default">Sort by</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-3 transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-3 transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="container mx-auto px-4">
          {/* Products Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-6"
            }
          >
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className={`product-card group ${viewMode === "list" ? "flex" : ""}`}
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div
                    className={`relative ${
                      viewMode === "list" ? "w-1/3" : "aspect-h-3 aspect-w-4"
                    }`}
                  >
                    <Image
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : "/placeholder.jpg"
                      }
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                    />

                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-lg font-semibold text-white">Out of Stock</span>
                      </div>
                    )}

                    {/* Modern corner badge */}
                    <div className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white">
                      NEW
                    </div>
                  </div>
                  <div className={`p-6 ${viewMode === "list" ? "w-2/3" : ""}`}>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-primary-600">
                      {product.name}
                    </h2>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium ${
                            product.stock > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                        </span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="h-4 w-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="p-6 pt-0">
                  <QuickAddToCart product={product} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center space-x-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                Previous
              </button>
              <span className="text-lg text-gray-600">
                Page <span className="font-semibold text-primary-600">{currentPage}</span> of{" "}
                <span className="font-semibold text-primary-600">{totalPages}</span>
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-900">No Products Found</h3>
              <p className="mx-auto max-w-md text-lg text-gray-600">
                We couldn't find any products matching your search. Try different keywords or browse
                all products.
              </p>
              <button onClick={() => setSearchQuery("")} className="btn btn-primary mt-6">
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
      <AuthDebugger />
    </Layout>
  );
}
