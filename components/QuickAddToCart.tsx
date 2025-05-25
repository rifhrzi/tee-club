'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import { redirectToSignup } from '@/utils/authRedirect';
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

  return (
    <div className="flex space-x-2 mt-2">
      <LoadingButton
        onClick={handleQuickAdd}
        isLoading={false}
        disabled={status === 'loading'}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm"
        loadingText="Adding..."
      >
        {status === 'loading' ? 'Checking...' : 'Add to Cart'}
      </LoadingButton>
      <LoadingButton
        onClick={handleBuyNow}
        isLoading={false}
        disabled={status === 'loading'}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm"
        loadingText="Processing..."
      >
        {status === 'loading' ? 'Checking...' : 'Buy Now'}
      </LoadingButton>
    </div>
  );
}
