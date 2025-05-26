'use client';

import React from 'react';
import Skeleton from './Skeleton';

export default function ProductImageGallerySkeleton() {
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Skeleton variant="rectangular" className="w-full h-full" />
        
        {/* Navigation Arrows */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Skeleton variant="circular" width={40} height={40} />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Skeleton variant="circular" width={40} height={40} />
        </div>
        
        {/* Zoom Button */}
        <div className="absolute bottom-4 right-4">
          <Skeleton variant="circular" width={40} height={40} />
        </div>
        
        {/* Image Counter */}
        <div className="absolute bottom-4 left-4">
          <Skeleton width={60} height={24} variant="rectangular" />
        </div>
      </div>

      {/* Thumbnail Images */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex-shrink-0">
            <Skeleton 
              width={80} 
              height={80} 
              variant="rectangular" 
              className="rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
