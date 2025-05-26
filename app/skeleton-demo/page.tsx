'use client';

import React, { useState } from 'react';
import {
  Skeleton,
  ProductCardSkeleton,
  ShopPageSkeleton,
  ProductDetailSkeleton,
  ProductImageGallerySkeleton,
  ProductInfoSkeleton,
} from '@/components/skeleton';

export default function SkeletonDemoPage() {
  const [activeDemo, setActiveDemo] = useState('skeleton');

  const demos = [
    { id: 'skeleton', name: 'Base Skeleton', component: <SkeletonDemo /> },
    { id: 'product-card', name: 'Product Card', component: <ProductCardDemo /> },
    { id: 'product-image', name: 'Product Image Gallery', component: <ProductImageGallerySkeleton /> },
    { id: 'product-info', name: 'Product Info', component: <ProductInfoSkeleton /> },
    { id: 'shop-page', name: 'Shop Page', component: <ShopPageSkeleton productsPerPage={6} /> },
    { id: 'product-detail', name: 'Product Detail', component: <ProductDetailSkeleton /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Skeleton Loading Components Demo</h1>
          <p className="text-lg text-gray-600">
            Interactive demonstration of skeleton loading components for improved perceived performance.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              {demos.find(d => d.id === activeDemo)?.name} Demo
            </h2>
          </div>
          <div className="p-6">
            {demos.find(d => d.id === activeDemo)?.component}
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Implementation Notes</h3>
          <div className="prose text-gray-600">
            <ul className="space-y-2">
              <li><strong>Shimmer Animation:</strong> Uses CSS transforms and gradients for smooth loading effects</li>
              <li><strong>Responsive Design:</strong> All skeleton components adapt to different screen sizes</li>
              <li><strong>Accessibility:</strong> Includes proper ARIA labels and role attributes</li>
              <li><strong>Performance:</strong> Lightweight components with minimal DOM overhead</li>
              <li><strong>Customizable:</strong> Support for different variants, animations, and dimensions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Variants</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Rectangular</h5>
            <Skeleton variant="rectangular" width={200} height={120} />
          </div>
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Circular</h5>
            <Skeleton variant="circular" width={80} height={80} />
          </div>
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Text Lines</h5>
            <Skeleton variant="text" lines={3} />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Animation Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Shimmer (Default)</h5>
            <Skeleton animation="shimmer" width={300} height={60} />
          </div>
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Pulse</h5>
            <Skeleton animation="pulse" width={300} height={60} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCardDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Grid View</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCardSkeleton viewMode="grid" />
          <ProductCardSkeleton viewMode="grid" />
          <ProductCardSkeleton viewMode="grid" />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">List View</h4>
        <div className="space-y-4">
          <ProductCardSkeleton viewMode="list" />
          <ProductCardSkeleton viewMode="list" />
        </div>
      </div>
    </div>
  );
}
