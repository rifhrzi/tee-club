'use client';

import React from 'react';
import Skeleton from './Skeleton';

export default function ProductInfoSkeleton() {
  return (
    <div className="space-y-6">
      {/* Product Title and Wishlist */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton variant="text" className="h-6 w-1/2" />
        </div>
        <Skeleton variant="circular" width={40} height={40} />
      </div>

      {/* Price and Stock Status */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton variant="text" className="h-8 w-24" />
          <Skeleton width={80} height={24} variant="rectangular" />
        </div>
        <Skeleton variant="text" className="h-4 w-32" />
      </div>

      {/* Product Description */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-5 w-20" />
        <Skeleton variant="text" lines={4} className="h-4" />
      </div>

      {/* Variants Section */}
      <div className="space-y-4">
        <Skeleton variant="text" className="h-5 w-16" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton 
              key={index} 
              height={48} 
              variant="rectangular" 
              className="rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-5 w-16" />
        <div className="flex items-center gap-3">
          <Skeleton width={120} height={40} variant="rectangular" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Skeleton height={56} variant="rectangular" className="w-full rounded-lg" />
        <Skeleton height={56} variant="rectangular" className="w-full rounded-lg" />
      </div>

      {/* Product Features */}
      <div className="space-y-4">
        <Skeleton variant="text" className="h-5 w-24" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
