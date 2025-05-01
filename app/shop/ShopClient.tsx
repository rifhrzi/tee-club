"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { formatPrice } from "@/constants";
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
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-center justify-between md:flex-row">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:mb-0">Shop Our Collection</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-full border-gray-300 py-2 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Sort by</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-full p-2 ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                } hover:bg-blue-500 hover:text-white`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-full p-2 ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                } hover:bg-blue-500 hover:text-white`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="w-full">
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
                className={`group relative overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div
                    className={`relative ${
                      viewMode === "list" ? "w-1/3" : "aspect-w-4 aspect-h-3"
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
                      className="object-cover"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <span className="font-bold text-white">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 ${viewMode === "list" ? "w-2/3" : ""}`}>
                    <h2 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      {product.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-gray-600">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm ${
                            product.stock > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 disabled:opacity-50"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No products found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
