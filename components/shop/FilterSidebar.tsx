"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, FunnelIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    priceRange: [number, number];
    inStock: boolean;
    rating: number;
  };
  onFiltersChange: (filters: any) => void;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    availability: true,
    rating: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: [min, max],
    });
  };

  const handleStockToggle = () => {
    onFiltersChange({
      ...filters,
      inStock: !filters.inStock,
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000000],
      inStock: false,
      rating: 0,
    });
  };

  const priceRanges = [
    { label: "Under Rp 100,000", min: 0, max: 100000 },
    { label: "Rp 100,000 - Rp 250,000", min: 100000, max: 250000 },
    { label: "Rp 250,000 - Rp 500,000", min: 250000, max: 500000 },
    { label: "Over Rp 500,000", min: 500000, max: 1000000 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-80 bg-white shadow-xl lg:relative lg:w-full lg:shadow-none"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6 lg:hidden">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Desktop Header */}
              <div className="hidden border-b border-gray-200 p-6 lg:block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Filter Content */}
              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {/* Price Range */}
                <div>
                  <button
                    onClick={() => toggleSection("price")}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                      Price Range
                    </h3>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedSections.price ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections.price && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-3"
                      >
                        {priceRanges.map((range, index) => (
                          <label key={index} className="flex cursor-pointer items-center space-x-3">
                            <input
                              type="radio"
                              name="priceRange"
                              checked={
                                filters.priceRange[0] === range.min &&
                                filters.priceRange[1] === range.max
                              }
                              onChange={() => handlePriceChange(range.min, range.max)}
                              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{range.label}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Availability */}
                <div>
                  <button
                    onClick={() => toggleSection("availability")}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                      Availability
                    </h3>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedSections.availability ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections.availability && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4"
                      >
                        <label className="flex cursor-pointer items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={filters.inStock}
                            onChange={handleStockToggle}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">In Stock Only</span>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Rating */}
                <div>
                  <button
                    onClick={() => toggleSection("rating")}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                      Rating
                    </h3>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedSections.rating ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections.rating && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-3"
                      >
                        {[4, 3, 2, 1].map((rating) => (
                          <label
                            key={rating}
                            className="flex cursor-pointer items-center space-x-3"
                          >
                            <input
                              type="radio"
                              name="rating"
                              checked={filters.rating === rating}
                              onChange={() => handleRatingChange(rating)}
                              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < rating ? "text-yellow-400" : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-sm text-gray-500">& up</span>
                            </div>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile Footer */}
              <div className="border-t border-gray-200 p-6 lg:hidden">
                <div className="flex space-x-3">
                  <button
                    onClick={clearAllFilters}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
