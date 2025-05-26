'use client';

import React from 'react';
import Skeleton from './Skeleton';
import ProductCardSkeleton from './ProductCardSkeleton';

interface ShopPageSkeletonProps {
  viewMode?: 'grid' | 'list';
  productsPerPage?: number;
}

export default function ShopPageSkeleton({ 
  viewMode = 'grid', 
  productsPerPage = 12 
}: ShopPageSkeletonProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <Skeleton variant="text" className="h-12 w-96 mx-auto bg-white/20" />
            <Skeleton variant="text" className="h-6 w-64 mx-auto bg-white/20" />
          </div>
        </div>
      </div>

      {/* Search and Sort Controls Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <Skeleton height={40} variant="rectangular" />
            </div>
            
            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <Skeleton width={120} height={40} variant="rectangular" />
              <Skeleton width={80} height={40} variant="rectangular" />
              <Skeleton width={40} height={40} variant="rectangular" />
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4">
            <Skeleton width={200} height={20} variant="text" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar Skeleton */}
          <div className="hidden w-80 flex-shrink-0 lg:block">
            <div className="sticky top-32 space-y-6">
              {/* Filter Title */}
              <Skeleton variant="text" className="h-6 w-32" />
              
              {/* Price Range Filter */}
              <div className="space-y-3">
                <Skeleton variant="text" className="h-5 w-24" />
                <Skeleton height={40} variant="rectangular" />
              </div>
              
              {/* Categories Filter */}
              <div className="space-y-3">
                <Skeleton variant="text" className="h-5 w-20" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton variant="rectangular" width={16} height={16} />
                      <Skeleton variant="text" className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Additional Filters */}
              <div className="space-y-3">
                <Skeleton variant="text" className="h-5 w-28" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton variant="rectangular" width={16} height={16} />
                      <Skeleton variant="text" className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Products Grid/List */}
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-6"
            }>
              {Array.from({ length: productsPerPage }).map((_, index) => (
                <ProductCardSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
            
            {/* Pagination Skeleton */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <Skeleton width={40} height={40} variant="rectangular" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} width={40} height={40} variant="rectangular" />
                ))}
                <Skeleton width={40} height={40} variant="rectangular" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
