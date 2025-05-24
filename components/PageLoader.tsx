"use client";

import React from 'react';

interface PageLoaderProps {
  message?: string;
  showLogo?: boolean;
  variant?: 'default' | 'minimal' | 'skeleton' | 'branded';
  fullScreen?: boolean;
}

export default function PageLoader({ 
  message = "Loading...", 
  showLogo = false, 
  variant = 'default',
  fullScreen = false
}: PageLoaderProps) {
  
  // Skeleton variant for content loading
  if (variant === 'skeleton') {
    return (
      <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[400px]'} bg-gray-50 animate-pulse`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            
            {/* Content grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Minimal variant for small components
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  // Branded variant with Tee Club styling
  if (variant === 'branded') {
    return (
      <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[300px]'} bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center`}>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-xl font-bold text-white">TC</span>
          </div>
          
          <div className="relative mb-4">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          
          <p className="text-gray-700 font-medium">{message}</p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1 mt-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  const containerClass = fullScreen 
    ? "min-h-screen bg-gray-50 flex items-center justify-center" 
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="text-center">
        {showLogo && (
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">TC</span>
            </div>
          </div>
        )}
        
        <div className="relative mb-4">
          {/* Main Spinner */}
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full mx-auto"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        
        <p className="text-gray-600 animate-pulse">{message}</p>
        
        {/* Progress Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for managing page loading state
export function usePageLoader() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState("Loading...");
  
  const showLoader = (loadingMessage?: string) => {
    if (loadingMessage) setMessage(loadingMessage);
    setIsLoading(true);
  };
  
  const hideLoader = () => {
    setIsLoading(false);
  };
  
  const updateMessage = (newMessage: string) => {
    setMessage(newMessage);
  };
  
  return {
    isLoading,
    message,
    showLoader,
    hideLoader,
    updateMessage,
    PageLoader: (props: Omit<PageLoaderProps, 'message'>) => 
      isLoading ? <PageLoader {...props} message={message} /> : null
  };
}
