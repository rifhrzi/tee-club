'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getStockStatus } from '@/lib/services/inventory';

interface StockStatusProps {
  stock: number;
  showQuantity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StockStatus({ 
  stock, 
  showQuantity = true, 
  size = 'md',
  className = '' 
}: StockStatusProps) {
  const stockInfo = getStockStatus(stock);

  const getIconComponent = () => {
    switch (stockInfo.status) {
      case 'in_stock':
        return CheckCircleIcon;
      case 'limited_stock':
        return ClockIcon;
      case 'low_stock':
        return ExclamationTriangleIcon;
      case 'out_of_stock':
        return XCircleIcon;
      default:
        return CheckCircleIcon;
    }
  };

  const getColorClasses = () => {
    switch (stockInfo.color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-600',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          gap: 'space-x-1',
        };
      case 'lg':
        return {
          container: 'px-4 py-3 text-base',
          icon: 'w-6 h-6',
          gap: 'space-x-3',
        };
      default: // md
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'w-4 h-4',
          gap: 'space-x-2',
        };
    }
  };

  const IconComponent = getIconComponent();
  const colors = getColorClasses();
  const sizes = getSizeClasses();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center rounded-lg border font-medium
        ${colors.bg} ${colors.border} ${colors.text}
        ${sizes.container} ${sizes.gap}
        ${className}
      `}
    >
      <IconComponent className={`${sizes.icon} ${colors.icon} flex-shrink-0`} />
      <span>
        {stockInfo.label}
        {showQuantity && stock > 0 && stockInfo.status === 'in_stock' && (
          <span className="ml-1 opacity-75">({stock} available)</span>
        )}
      </span>
    </motion.div>
  );
}

// Compact version for use in product cards
export function StockBadge({ stock, className = '' }: { stock: number; className?: string }) {
  const stockInfo = getStockStatus(stock);
  
  const getColorClasses = () => {
    switch (stockInfo.color) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
        ${getColorClasses()}
        ${className}
      `}
    >
      {stockInfo.status === 'out_of_stock' ? 'Out of Stock' : 
       stockInfo.status === 'low_stock' ? `${stock} left` :
       stockInfo.status === 'limited_stock' ? `${stock} left` :
       'In Stock'}
    </span>
  );
}

// Stock progress bar for visual representation
export function StockProgressBar({ 
  current, 
  max, 
  className = '' 
}: { 
  current: number; 
  max: number; 
  className?: string; 
}) {
  const percentage = Math.min((current / max) * 100, 100);
  const stockInfo = getStockStatus(current);

  const getBarColor = () => {
    switch (stockInfo.color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'orange':
        return 'bg-orange-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Stock Level</span>
        <span className="text-sm text-gray-600">{current} / {max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-2 rounded-full ${getBarColor()}`}
        />
      </div>
      <div className="mt-1">
        <StockStatus stock={current} size="sm" showQuantity={false} />
      </div>
    </div>
  );
}

// Stock alert component for low stock warnings
export function StockAlert({ 
  stock, 
  threshold = 5,
  className = '' 
}: { 
  stock: number; 
  threshold?: number;
  className?: string; 
}) {
  if (stock > threshold) return null;

  const stockInfo = getStockStatus(stock);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-3 rounded-lg border-l-4 
        ${stock === 0 
          ? 'bg-red-50 border-red-400 text-red-700' 
          : 'bg-orange-50 border-orange-400 text-orange-700'
        }
        ${className}
      `}
    >
      <div className="flex items-center">
        <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
        <div>
          <p className="font-medium">
            {stock === 0 ? 'Out of Stock' : 'Low Stock Alert'}
          </p>
          <p className="text-sm mt-1">
            {stock === 0 
              ? 'This item is currently out of stock and cannot be purchased.'
              : `Only ${stock} item${stock === 1 ? '' : 's'} remaining. Order soon!`
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Quantity selector with stock validation
export function QuantitySelector({
  value,
  onChange,
  maxStock,
  disabled = false,
  className = '',
}: {
  value: number;
  onChange: (quantity: number) => void;
  maxStock: number;
  disabled?: boolean;
  className?: string;
}) {
  const canIncrease = value < maxStock && maxStock > 0;
  const canDecrease = value > 1;

  const handleIncrease = () => {
    if (canIncrease) {
      onChange(value + 1);
    }
  };

  const handleDecrease = () => {
    if (canDecrease) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 1;
    const clampedValue = Math.min(Math.max(newValue, 1), maxStock);
    onChange(clampedValue);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || !canDecrease}
        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        −
      </button>
      
      <input
        type="number"
        min="1"
        max={maxStock}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-16 h-8 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || !canIncrease}
        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        +
      </button>
      
      {maxStock > 0 && (
        <span className="text-xs text-gray-500 ml-2">
          Max: {maxStock}
        </span>
      )}
    </div>
  );
}
