"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  width = 48,
  height = 48,
  className = "",
  fallbackSrc = "/placeholder-image.svg",
  priority = false,
}: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Handle image load error
  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  // Check if the URL is a valid external URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // If the src is not a valid URL, use fallback immediately
  const finalSrc = isValidUrl(imageSrc) ? imageSrc : fallbackSrc;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className="object-cover"
        onError={handleError}
        priority={priority}
        sizes={`${width}px`}
        style={{
          width: "100%",
          height: "100%",
        }}
        // Add loading placeholder
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />

      {/* Error state overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <i className="fas fa-image text-lg text-gray-400"></i>
            <p className="mt-1 text-xs text-gray-500">No Image</p>
          </div>
        </div>
      )}
    </div>
  );
}
