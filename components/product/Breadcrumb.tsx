'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      {/* Home */}
      <Link 
        href="/" 
        className="flex items-center hover:text-primary-600 transition-colors"
      >
        <HomeIcon className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
      
      {/* Shop */}
      <Link 
        href="/shop" 
        className="hover:text-primary-600 transition-colors"
      >
        Shop
      </Link>
      
      {/* Dynamic items */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-primary-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
