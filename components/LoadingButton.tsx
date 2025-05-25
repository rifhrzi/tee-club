'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps {
  isLoading: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export default function LoadingButton({
  isLoading,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  children,
  loadingText
}: LoadingButtonProps) {
  const baseClasses = 'rounded-md font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const defaultClasses = 'bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 focus:ring-blue-500';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${defaultClasses} ${className} ${isLoading ? 'relative' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="small" color="white" />
          {loadingText && <span className="ml-2">{loadingText}</span>}
          <span className="sr-only">Loading</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
