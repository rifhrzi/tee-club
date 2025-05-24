"use client";

import React, { useState, useEffect } from 'react';
import useCartStore from '@/store/cartStore';

export default function CartDebugPage() {
  const cart = useCartStore(state => state.cart);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Debug cart contents
    console.log('Cart Debug Page - Cart contents:', cart);
    
    const debugData = {
      cartLength: cart.length,
      cartItems: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productPrice: item.product.price,
        hasVariant: !!item.product.variant,
        hasVariantId: !!item.product.variantId,
        variant: item.product.variant,
        variantId: item.product.variantId,
        quantity: item.quantity,
        fullProduct: item.product
      }))
    };
    
    setDebugInfo(debugData);
  }, [cart]);

  const sendCartToDebugAPI = async () => {
    try {
      const response = await fetch('/api/debug/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart,
          debugInfo
        }),
      });

      const result = await response.json();
      console.log('Debug API response:', result);
      alert('Cart data sent to debug API. Check console for details.');
    } catch (error) {
      console.error('Error sending cart to debug API:', error);
      alert('Error sending cart data');
    }
  };

  const clearCart = () => {
    useCartStore.getState().clearCart();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🛒 Cart Debug Page
          </h1>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={sendCartToDebugAPI}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send Cart to Debug API
              </button>
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear Cart
              </button>
            </div>

            {debugInfo && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">📊 Cart Summary</h3>
                  <p><strong>Items in cart:</strong> {debugInfo.cartLength}</p>
                </div>

                {debugInfo.cartItems.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">🛍️ Cart Items</h3>
                    <div className="space-y-3">
                      {debugInfo.cartItems.map((item: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <h4 className="font-medium">{item.productName}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <p><strong>Product ID:</strong> {item.productId}</p>
                            <p><strong>Price:</strong> {item.productPrice}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Has Variant:</strong> {item.hasVariant ? 'Yes' : 'No'}</p>
                            <p><strong>Has Variant ID:</strong> {item.hasVariantId ? 'Yes' : 'No'}</p>
                            {item.variant && (
                              <div className="mt-2">
                                <p><strong>Variant:</strong></p>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                  {JSON.stringify(item.variant, null, 2)}
                                </pre>
                              </div>
                            )}
                            {item.variantId && (
                              <p><strong>Variant ID:</strong> {item.variantId}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">🔧 Raw Cart Data</h3>
                  <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Instructions</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Go to the shop page and add some products to cart</li>
              <li>2. Come back to this page to see the cart structure</li>
              <li>3. Click "Send Cart to Debug API" to log data to console</li>
              <li>4. Check the terminal for detailed cart information</li>
              <li>5. Use this info to fix the checkout issue</li>
            </ol>
          </div>

          <div className="mt-6 flex gap-4">
            <a
              href="/shop"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              🛍️ Go to Shop
            </a>
            <a
              href="/cart"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              🛒 View Cart
            </a>
            <a
              href="/checkout"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              💳 Try Checkout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
