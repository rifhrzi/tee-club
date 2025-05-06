"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { formatPrice } from "@/constants";

// Import Layout with dynamic import to avoid hydration issues
const AdminLayout = dynamic(() => import("@/components/admin/AdminLayout"), { ssr: false });

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  variants: Variant[];
}

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function TestStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product selection
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
    setSelectedVariant("");
  };

  // Handle variant selection
  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariant(e.target.value);
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Handle test stock reduction
  const handleTestStockReduction = async () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    setTestLoading(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await fetch("/api/testing/reduce-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct,
          variantId: selectedVariant || undefined,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reduce stock");
      }

      setTestResult(data);

      // Refresh products to show updated stock
      const productsResponse = await fetch("/api/products");
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setTestLoading(false);
    }
  };

  // Get current product
  const currentProduct = products.find((p) => p.id === selectedProduct);

  // Get current variant
  const currentVariant = currentProduct?.variants.find((v) => v.id === selectedVariant);

  // Get current stock
  const currentStock = selectedVariant
    ? currentVariant?.stock || 0
    : currentProduct?.stock || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Test Stock Reduction</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-6">
            <p className="mb-4 text-gray-600">
              This page allows you to test stock reduction functionality without going through the
              payment process. This is useful for testing and debugging.
            </p>
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This will actually reduce the stock in the database. Use with caution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-4 text-center">Loading products...</div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                  Select Product
                </label>
                <select
                  id="product"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={selectedProduct}
                  onChange={handleProductChange}
                >
                  <option value="">-- Select a product --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Stock: {product.stock} - {formatPrice(product.price)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && currentProduct?.variants.length > 0 && (
                <div>
                  <label htmlFor="variant" className="block text-sm font-medium text-gray-700">
                    Select Variant (Optional)
                  </label>
                  <select
                    id="variant"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    value={selectedVariant}
                    onChange={handleVariantChange}
                  >
                    <option value="">-- No variant (use product stock) --</option>
                    {currentProduct.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name} - Stock: {variant.stock} - {formatPrice(variant.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity to Reduce
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={currentStock}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleTestStockReduction}
                  disabled={!selectedProduct || testLoading || quantity <= 0 || quantity > currentStock}
                >
                  {testLoading ? "Processing..." : "Test Stock Reduction"}
                </button>
              </div>

              {testResult && (
                <div className="mt-6 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{testResult.message}</p>
                        <ul className="mt-2 list-inside list-disc">
                          <li>Previous stock: {testResult.before}</li>
                          <li>Reduced by: {testResult.reduction}</li>
                          <li>New stock: {testResult.after}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
