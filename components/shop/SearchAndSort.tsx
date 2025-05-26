'use client';

import React from 'react';
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFilterToggle: () => void;
  resultsCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function SearchAndSort({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onFilterToggle,
  resultsCount,
  totalCount,
  hasActiveFilters,
  onClearFilters
}: SearchAndSortProps) {
  const sortOptions = [
    { value: 'default', label: 'Featured' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      <div className="container mx-auto px-4 py-4">
        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Shop Collection
            </h2>
            <span className="text-sm text-gray-500">
              {resultsCount === totalCount 
                ? `${totalCount} products`
                : `${resultsCount} of ${totalCount} products`
              }
            </span>
          </div>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors"
            >
              <span>Clear filters</span>
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Side - Search and Filter */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={onFilterToggle}
              className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Sort and View Mode */}
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Grid view"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="List view"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {resultsCount > 0 ? (
                <>
                  Found <span className="font-semibold">{resultsCount}</span> product
                  {resultsCount !== 1 ? 's' : ''} matching "
                  <span className="font-semibold">{searchQuery}</span>"
                </>
              ) : (
                <>
                  No products found matching "
                  <span className="font-semibold">{searchQuery}</span>". Try different keywords.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
