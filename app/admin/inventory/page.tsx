'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  CubeIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StockProgressBar, StockBadge } from '@/components/product/StockStatus';
import LoadingButton from '@/components/LoadingButton';

interface Product {
  id: string;
  name: string;
  stock: number;
  variants: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
}

interface StockAdjustment {
  productId: string;
  variantId?: string;
  adjustment: number;
  reason: string;
  type: 'ADJUSTMENT' | 'RESTOCK' | 'DAMAGE';
}

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustmentModal, setAdjustmentModal] = useState<{
    isOpen: boolean;
    product?: Product;
    variant?: { id: string; name: string; stock: number };
  }>({ isOpen: false });
  const [adjustment, setAdjustment] = useState<StockAdjustment>({
    productId: '',
    adjustment: 0,
    reason: '',
    type: 'ADJUSTMENT',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/inventory');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustmentModal = (product: Product, variant?: { id: string; name: string; stock: number }) => {
    setAdjustmentModal({ isOpen: true, product, variant });
    setAdjustment({
      productId: product.id,
      variantId: variant?.id,
      adjustment: 0,
      reason: '',
      type: 'ADJUSTMENT',
    });
  };

  const closeAdjustmentModal = () => {
    setAdjustmentModal({ isOpen: false });
    setAdjustment({
      productId: '',
      adjustment: 0,
      reason: '',
      type: 'ADJUSTMENT',
    });
  };

  const handleStockAdjustment = async () => {
    if (!adjustment.reason.trim() || adjustment.adjustment === 0) {
      alert('Please provide a reason and adjustment amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustment),
      });

      if (response.ok) {
        await fetchInventory();
        closeAdjustmentModal();
        alert('Stock adjusted successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to adjust stock'}`);
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLowStockProducts = () => {
    const lowStock: Array<{ product: Product; variant?: any; stock: number }> = [];
    
    products.forEach(product => {
      if (product.stock <= 5) {
        lowStock.push({ product, stock: product.stock });
      }
      product.variants.forEach(variant => {
        if (variant.stock <= 5) {
          lowStock.push({ product, variant, stock: variant.stock });
        }
      });
    });
    
    return lowStock;
  };

  const getTotalProducts = () => products.length;
  const getTotalVariants = () => products.reduce((sum, p) => sum + p.variants.length, 0);
  const getLowStockCount = () => getLowStockProducts().length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage product stock levels</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalProducts()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Variants</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalVariants()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{getLowStockCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-900">Just now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {getLowStockCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-medium text-orange-800">Low Stock Alert</h3>
            </div>
            <p className="text-orange-700 mt-1">
              {getLowStockCount()} item(s) are running low on stock and need attention.
            </p>
          </motion.div>
        )}

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Product Inventory</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <React.Fragment key={product.id}>
                    {/* Main Product Row */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">Base Product</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StockProgressBar current={product.stock} max={100} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StockBadge stock={product.stock} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openAdjustmentModal(product)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                    
                    {/* Variant Rows */}
                    {product.variants.map((variant) => (
                      <tr key={variant.id} className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="ml-4 font-medium text-gray-700">↳ {variant.name}</div>
                          <div className="ml-4 text-sm text-gray-500">Variant</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StockProgressBar current={variant.stock} max={100} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StockBadge stock={variant.stock} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openAdjustmentModal(product, variant)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustmentModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adjust Stock - {adjustmentModal.product?.name}
                {adjustmentModal.variant && ` (${adjustmentModal.variant.name})`}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock: {adjustmentModal.variant?.stock || adjustmentModal.product?.stock}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustment.type}
                    onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="ADJUSTMENT">Manual Adjustment</option>
                    <option value="RESTOCK">Restock</option>
                    <option value="DAMAGE">Damage/Loss</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Amount
                  </label>
                  <input
                    type="number"
                    value={adjustment.adjustment}
                    onChange={(e) => setAdjustment({ ...adjustment, adjustment: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter positive or negative number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use positive numbers to increase stock, negative to decrease
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Explain the reason for this adjustment"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeAdjustmentModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleStockAdjustment}
                  isLoading={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Apply Adjustment
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
