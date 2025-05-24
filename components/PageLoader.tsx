"use client";

import React from 'react';

interface PageLoaderProps {
  message?: string;
  showLogo?: boolean;
  variant?: 'default' | 'minimal' | 'skeleton';
}

export default function PageLoader({ 
  message = "Loading...", 
  showLogo = true, 
  variant = 'default' 
}: PageLoaderProps) {
  
  if (variant === 'skeleton') {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {showLogo && (
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">TC</span>
            </div>
          </div>
        )}
        
        <div className="relative">
          {/* Main Spinner */}
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full mx-auto"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        
        <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
        
        {/* Progress Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for using page loader
export function usePageLoader() {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const showLoader = (message?: string) => {
    setIsLoading(true);
  };
  
  const hideLoader = () => {
    setIsLoading(false);
  };
  
  return {
    isLoading,
    showLoader,
    hideLoader,
    PageLoader: ({ message, showLogo, variant }: PageLoaderProps) => 
      isLoading ? <PageLoader message={message} showLogo={showLogo} variant={variant} /> : null
  };
}
