"use client";

import React, { useState } from 'react';
import useCartStore from '@/store/cartStore';

export default function ResetCartPage() {
  const { cart, clearCart } = useCartStore();
  const [resetComplete, setResetComplete] = useState(false);

  const handleCompleteReset = () => {
    try {
      // 1. Clear the cart store
      clearCart();
      
      // 2. Clear all cart-related localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart-storage');
        localStorage.removeItem('checkout_form_data');
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('nextauth_checkout_session');
        localStorage.removeItem('checkout_return_url');
        localStorage.removeItem('checkout_redirect_attempts');
        localStorage.removeItem('login_redirect');
        
        console.log('All cart-related localStorage cleared');
      }
      
      // 3. Force reload to ensure clean state
      setResetComplete(true);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error during reset:', error);
      alert('Error during reset. Please try again.');
    }
  };

  const goToShop = () => {
    window.location.href = '/shop';
  };

  if (resetComplete) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Cart Reset Complete!
            </h1>
            <p className="text-gray-600 mb-6">
              Your cart has been completely reset. The page will reload automatically to ensure a clean state.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔄 Complete Cart Reset
          </h1>
          
          <div className="space-y-6">
            {/* Current Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">📊 Current Status</h3>
              <p><strong>Items in cart:</strong> {cart.length}</p>
              {cart.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600">
                    ⚠️ Your cart contains {cart.length} item(s) that may have invalid product IDs from before the database reset.
                  </p>
                </div>
              )}
            </div>

            {/* Problem Explanation */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">🔍 The Problem</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>Your cart contains product IDs from before the database was reset. These products no longer exist, causing the "Unknown Product" error during checkout.</p>
                <p><strong>Solution:</strong> Complete cart reset to clear all stale data.</p>
              </div>
            </div>

            {/* Reset Action */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🛠️ What This Will Do</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Clear all items from your cart</li>
                <li>• Remove all cart-related localStorage data</li>
                <li>• Clear any stored checkout form data</li>
                <li>• Reset authentication redirect data</li>
                <li>• Reload the page for a clean state</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCompleteReset}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                🔄 Complete Reset
              </button>
              <button
                onClick={goToShop}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                🛍️ Go to Shop
              </button>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">📋 After Reset</h4>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Page will reload automatically</li>
                <li>2. Go to the shop page</li>
                <li>3. Add fresh products to cart</li>
                <li>4. Try checkout again - it should work perfectly!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
