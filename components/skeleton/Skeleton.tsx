'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'pulse' | 'shimmer' | 'none';
  lines?: number; // For text variant
}

export default function Skeleton({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'shimmer',
  lines = 1,
}: SkeletonProps) {
  const getBaseClasses = () => {
    const baseClasses = 'bg-gray-200 relative overflow-hidden';
    
    switch (variant) {
      case 'circular':
        return `${baseClasses} rounded-full`;
      case 'text':
        return `${baseClasses} rounded`;
      case 'rectangular':
      default:
        return `${baseClasses} rounded-lg`;
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'shimmer':
        return '';
      case 'none':
      default:
        return '';
    }
  };

  const getInlineStyles = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
    if (height) styles.height = typeof height === 'number' ? `${height}px` : height;
    return styles;
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return 'w-12 h-12';
      case 'text':
        return 'w-full h-4';
      case 'rectangular':
      default:
        return 'w-full h-48';
    }
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`
              ${getBaseClasses()}
              ${getAnimationClasses()}
              ${index === lines - 1 ? 'w-3/4' : 'w-full'}
              h-4
              ${className}
            `}
            style={getInlineStyles()}
          >
            {animation === 'shimmer' && (
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        ${getBaseClasses()}
        ${getAnimationClasses()}
        ${!width && !height ? getDefaultDimensions() : ''}
        ${className}
      `}
      style={getInlineStyles()}
      role="status"
      aria-label="Loading..."
    >
      {animation === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
    </div>
  );
}
