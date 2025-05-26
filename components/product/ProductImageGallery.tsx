"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Filter out invalid URLs and provide fallback
  const validImages =
    images?.filter((img) => {
      try {
        new URL(img);
        return true;
      } catch {
        return false;
      }
    }) || [];

  // Use placeholder if no valid images
  const imagesToUse = validImages.length > 0 ? validImages : ["/placeholder-image.svg"];

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagesToUse.length);
    setImageLoading(true);
    setImageError(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagesToUse.length) % imagesToUse.length);
    setImageLoading(true);
    setImageError(false);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
    setImageLoading(true);
    setImageError(false);
  };

  // Fallback for no images
  if (!imagesToUse || imagesToUse.length === 0) {
    return (
      <div className="aspect-square flex items-center justify-center rounded-xl bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-lg bg-gray-300"></div>
          <p className="text-sm text-gray-500">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square group relative overflow-hidden rounded-xl bg-gray-50">
        {imageLoading && (
          <div className="absolute inset-0 flex animate-pulse items-center justify-center rounded-xl bg-gray-100">
            <div className="text-sm text-gray-500">Loading image...</div>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-100">
            <div className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-gray-300"></div>
              <p className="text-sm text-gray-500">Image unavailable</p>
              <button
                onClick={() => {
                  setImageError(false);
                  setImageLoading(true);
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <Image
            src={imagesToUse[currentImageIndex]}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={currentImageIndex === 0}
          />
        )}

        {/* Navigation arrows for multiple images */}
        {imagesToUse.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Zoom button */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute bottom-2 right-2 rounded-full bg-white/80 p-2 shadow-lg transition-opacity hover:bg-white"
          aria-label="Zoom image"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-800" />
        </button>
      </div>

      {/* Thumbnail navigation */}
      {imagesToUse.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {imagesToUse.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === currentImageIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setIsZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-h-full max-w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Image
                src={imagesToUse[currentImageIndex]}
                alt={`${productName} - Zoomed view`}
                width={800}
                height={800}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
              <button
                onClick={() => setIsZoomOpen(false)}
                className="absolute -right-2 -top-2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
                aria-label="Close zoom"
              >
                <XMarkIcon className="h-5 w-5 text-gray-800" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
