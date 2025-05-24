"use client";

import React, { useState, useEffect } from 'react';
import useCartStore from '@/store/cartStore';

export default function FixCartPage() {
  const { cart, clearCart, addToCart } = useCartStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/debug/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleClearCart = () => {
    clearCart();
    alert('Cart cleared successfully!');
  };

  const handleAddToCart = async (product: any) => {
    setLoading(true);
    try {
      // Add product to cart with proper structure and skip auth check since we're already authenticated
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        images: [], // Add empty images array
        stock: product.stock
      }, { skipAuthCheck: true });
      alert(`Added "${product.name}" to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    } finally {
      setLoading(false);
    }
  };

  const testCheckout = () => {
    if (cart.length === 0) {
      alert('Please add a product to cart first');
      return;
    }
    window.location.href = '/checkout';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🛠️ Fix Cart & Test Checkout
          </h1>

          <div className="space-y-6">
            {/* Current Cart Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">📊 Current Cart Status</h3>
              <p><strong>Items in cart:</strong> {cart.length}</p>
              {cart.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium">Cart Items:</h4>
                  <ul className="text-sm text-gray-600 mt-1">
                    {cart.map((item, index) => (
                      <li key={index}>
                        {item.product.name} (ID: {item.product.id}) - Qty: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleClearCart}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                🗑️ Clear Cart
              </button>
              <button
                onClick={testCheckout}
                disabled={cart.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                💳 Test Checkout
              </button>
            </div>

            {/* Available Products */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4">🛍️ Available Products (Add to Cart)</h3>
              {products.length === 0 ? (
                <p className="text-gray-600">Loading products...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded border">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">ID: {product.id}</p>
                      <p className="text-sm text-gray-600">Price: Rp {product.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                      {product.variants.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Variants:</p>
                          <ul className="text-xs text-gray-500">
                            {product.variants.map((variant: any) => (
                              <li key={variant.id}>
                                {variant.name} - Stock: {variant.stock}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={loading || product.stock === 0}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">📋 How to Fix & Test</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Click "Clear Cart" to remove any invalid items</li>
                <li>2. Add a fresh product from the list above</li>
                <li>3. Click "Test Checkout" to try the checkout flow</li>
                <li>4. Check terminal logs for detailed debugging info</li>
                <li>5. If it works, the issue was stale cart data</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
