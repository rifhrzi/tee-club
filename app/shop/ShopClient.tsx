"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import SearchAndSort from "@/components/shop/SearchAndSort";
import LoadingSpinner from "@/components/LoadingSpinner";
import AuthDebugger from "@/components/AuthDebugger";
import { ShopPageSkeleton } from "@/components/skeleton";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
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
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000] as [number, number],
    inStock: false,
    rating: 0,
  });
  const productsPerPage = 12;

  // Ensure initial render is consistent
  useEffect(() => {
    console.log("Initial products:", products);
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [products]);

  // Advanced filtering and sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Price filter
      const matchesPrice =
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      // Stock filter
      const matchesStock = !filters.inStock || product.stock > 0;

      return matchesSearch && matchesPrice && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "newest":
          return 0; // Would need createdAt field
        case "rating":
          return 0; // Would need rating field
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, sortBy, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, filters]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 1000000 ||
      filters.inStock ||
      filters.rating > 0
    );
  }, [filters]);

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      inStock: false,
      rating: 0,
    });
    setSearchQuery("");
  };

  // Show skeleton loading while data is being loaded
  if (isLoading) {
    return (
      <Layout>
        <ShopPageSkeleton viewMode={viewMode} productsPerPage={productsPerPage} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="border-b border-gray-200 bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl"
              >
                Shop <span className="text-primary-600">Collection</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mx-auto max-w-2xl text-lg text-gray-600"
              >
                Discover our premium t-shirt collection designed for style and comfort
              </motion.p>
            </div>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <SearchAndSort
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFilterToggle={() => setShowFilters(true)}
          resultsCount={filteredAndSortedProducts.length}
          totalCount={products.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <div className="hidden w-80 flex-shrink-0 lg:block">
              <div className="sticky top-32">
                <FilterSidebar
                  isOpen={true}
                  onClose={() => {}}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="flex-1">
              {/* Loading State */}
              {false && (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="large" text="Loading products..." />
                </div>
              )}

              {/* Products Grid/List */}
              {paginatedProducts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                      : "space-y-6"
                  }
                >
                  {paginatedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      index={index}
                    />
                  ))}
                </motion.div>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 text-center"
                >
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
                  <p className="mx-auto mb-6 max-w-md text-lg text-gray-600">
                    {searchQuery || hasActiveFilters
                      ? "We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
                      : "No products are currently available."}
                  </p>
                  {(searchQuery || hasActiveFilters) && (
                    <button
                      onClick={clearAllFilters}
                      className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
                    >
                      Clear All Filters
                    </button>
                  )}
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 flex items-center justify-center"
                >
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="mr-1 h-4 w-4" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              page === currentPage
                                ? "bg-primary-600 text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRightIcon className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Sidebar */}
        <FilterSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
      <AuthDebugger />
    </Layout>
  );
}
