'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  color = 'primary',
  fullScreen = false,
  text
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  // Color mapping
  const colorMap = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  // Container classes for full screen or inline
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div
          className={`animate-spin rounded-full border-2 ${sizeMap[size]} ${colorMap[color]}`}
          role="status"
          aria-label="loading"
        />
        {text && (
          <p className={`mt-2 text-sm ${color === 'white' ? 'text-white' : 'text-gray-700'}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
