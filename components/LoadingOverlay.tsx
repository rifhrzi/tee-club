'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  transparent?: boolean;
}

export default function LoadingOverlay({ 
  isLoading, 
  text = 'Loading...', 
  transparent = false 
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        transparent ? 'bg-black bg-opacity-30' : 'bg-white'
      }`}
    >
      <LoadingSpinner 
        size="large" 
        color={transparent ? 'white' : 'primary'} 
        text={text} 
      />
    </div>
  );
}
