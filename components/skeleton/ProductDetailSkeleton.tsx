'use client';

import React from 'react';
import Skeleton from './Skeleton';
import ProductImageGallerySkeleton from './ProductImageGallerySkeleton';
import ProductInfoSkeleton from './ProductInfoSkeleton';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="h-4 w-12" />
            <Skeleton variant="text" className="h-4 w-4" />
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-4" />
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
        </div>

        {/* Main Product Section */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-8">
            {/* Product Images */}
            <div>
              <ProductImageGallerySkeleton />
            </div>

            {/* Product Information */}
            <div>
              <ProductInfoSkeleton />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          {/* Section Title */}
          <div className="mb-8 text-center">
            <Skeleton variant="text" className="h-8 w-48 mx-auto" />
            <Skeleton variant="text" className="h-5 w-64 mx-auto mt-2" />
          </div>

          {/* Related Products Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} viewMode="grid" />
            ))}
          </div>
        </div>

        {/* Product Details Tabs Section */}
        <div className="mt-16">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-8 py-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} variant="text" className="h-5 w-20" />
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-4">
              <Skeleton variant="text" className="h-6 w-32" />
              <Skeleton variant="text" lines={6} className="h-4" />
              
              <div className="mt-6 space-y-3">
                <Skeleton variant="text" className="h-5 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton variant="circular" width={6} height={6} />
                      <Skeleton variant="text" className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
