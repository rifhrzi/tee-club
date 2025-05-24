'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import { redirectToSignup } from '@/utils/authRedirect';
import { getStockStatus } from '@/utils/stockValidation';
import LoadingButton from './LoadingButton';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  images: string[];
}

interface QuickAddToCartProps {
  product: Product;
}

export default function QuickAddToCart({ product }: QuickAddToCartProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = status === 'authenticated';

  // Get stock status information
  const stockStatus = getStockStatus(product.stock);

  const handleQuickAdd = () => {
    console.log('QuickAddToCart: Button clicked');
    console.log('QuickAddToCart: Authentication state:', {
      status,
      isAuthenticated,
      sessionExists: !!session,
      userEmail: session?.user?.email || 'none'
    });

    // Don't proceed if session is still loading
    if (status === 'loading') {
      console.log('QuickAddToCart: Session still loading, please wait...');
      return;
    }

    // Debug cookies
    if (typeof window !== 'undefined') {
      console.log('QuickAddToCart: Current cookies:', document.cookie);
    }

    if (!isAuthenticated) {
      console.log('QuickAddToCart: User not authenticated, redirecting to signup');
      redirectToSignup(window.location.pathname);
      return;
    }

    console.log('QuickAddToCart: User is authenticated, adding to cart');

    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        stock: product.stock,
        images: product.images,
      };

      // Add to cart with skipAuthCheck since we already verified authentication
      addToCart(cartProduct, {
        currentPath: window.location.pathname,
        skipAuthCheck: true
      });

      console.log('QuickAddToCart: Product added successfully');
    } catch (error) {
      console.error('QuickAddToCart: Error adding to cart:', error);
    }
  };

  const handleBuyNow = () => {
    console.log('QuickAddToCart: Buy Now clicked');

    // Don't proceed if session is still loading
    if (status === 'loading') {
      console.log('QuickAddToCart: Session still loading for Buy Now, please wait...');
      return;
    }

    if (!isAuthenticated) {
      console.log('QuickAddToCart: User not authenticated for Buy Now, redirecting');
      redirectToSignup('/cart');
      return;
    }

    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        stock: product.stock,
        images: product.images,
      };

      // Add to cart with skipAuthCheck since we already verified authentication
      addToCart(cartProduct, {
        currentPath: '/cart',
        skipAuthCheck: true
      });

      // Navigate to cart
      router.push('/cart');
    } catch (error) {
      console.error('QuickAddToCart: Error with Buy Now:', error);
    }
  };

  // Check if buttons should be disabled
  const isDisabled = status === 'loading' || !stockStatus.available;

  return (
    <div className="space-y-2 mt-2">
      {/* Stock status indicator */}
      <div className={`text-xs px-2 py-1 rounded-full text-center ${stockStatus.bgColor} ${stockStatus.color}`}>
        {stockStatus.text}
      </div>

      <div className="flex space-x-2">
        <LoadingButton
          onClick={handleQuickAdd}
          isLoading={false}
          disabled={isDisabled}
          className={`flex-1 px-3 py-2 text-sm text-white ${
            stockStatus.available
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          loadingText="Adding..."
        >
          {status === 'loading' ? 'Checking...' :
           !stockStatus.available ? 'Out of Stock' : 'Add to Cart'}
        </LoadingButton>
        <LoadingButton
          onClick={handleBuyNow}
          isLoading={false}
          disabled={isDisabled}
          className={`flex-1 px-3 py-2 text-sm text-white ${
            stockStatus.available
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          loadingText="Processing..."
        >
          {status === 'loading' ? 'Checking...' :
           !stockStatus.available ? 'Out of Stock' : 'Buy Now'}
        </LoadingButton>
      </div>
    </div>
  );
}
