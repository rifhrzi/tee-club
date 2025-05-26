'use client';

import React from 'react';
import Skeleton from './Skeleton';

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export default function ProductCardSkeleton({ viewMode = 'grid' }: ProductCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex gap-6 p-6">
          {/* Image */}
          <div className="flex-shrink-0">
            <Skeleton width={200} height={150} variant="rectangular" />
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-4">
            {/* Title */}
            <Skeleton variant="text" className="h-6" />
            
            {/* Description */}
            <Skeleton variant="text" lines={2} className="h-4" />
            
            {/* Price and Stock */}
            <div className="flex items-center justify-between">
              <Skeleton width={80} height={24} variant="text" />
              <Skeleton width={60} height={20} variant="rectangular" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Skeleton width={120} height={40} variant="rectangular" />
              <Skeleton width={100} height={40} variant="rectangular" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Skeleton variant="rectangular" className="w-full h-full" />
        
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3">
          <Skeleton variant="circular" width={32} height={32} />
        </div>
        
        {/* Stock Badge */}
        <div className="absolute top-3 left-3">
          <Skeleton width={70} height={20} variant="rectangular" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Product Title */}
        <Skeleton variant="text" className="h-5" />
        
        {/* Product Description */}
        <Skeleton variant="text" lines={2} className="h-4" />
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <Skeleton width={80} height={24} variant="text" />
          <Skeleton variant="circular" width={24} height={24} />
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <Skeleton width="100%" height={36} variant="rectangular" />
          <Skeleton width="100%" height={36} variant="rectangular" />
        </div>
      </div>
    </div>
  );
}
