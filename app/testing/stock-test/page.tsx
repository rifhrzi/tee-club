"use client";

import React, { useState } from 'react';

export default function StockTestPage() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const checkOrder = async () => {
    if (!orderId.trim()) {
      alert('Please enter an Order ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/testing/fulfill-order?orderId=${orderId}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrderDetails(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to check order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fulfillOrder = async () => {
    if (!orderId.trim()) {
      alert('Please enter an Order ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/testing/fulfill-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert('Order fulfilled successfully! Check the results below.');
      } else {
        alert(`Fulfillment failed: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to fulfill order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Stock Management Test
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order ID to Test:
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g., ORDER-1748042701775)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={checkOrder}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Order'}
              </button>
            </div>
          </div>

          {orderDetails && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">📋 Order Details</h3>
              <p><strong>Order ID:</strong> {orderDetails.order.id}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${
                orderDetails.order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                orderDetails.order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>{orderDetails.order.status}</span></p>
              <p><strong>Total Amount:</strong> Rp {orderDetails.order.totalAmount.toLocaleString()}</p>
              <p><strong>Items:</strong> {orderDetails.itemCount}</p>
              
              <div className="mt-3">
                <h4 className="font-medium mb-2">Items in Order:</h4>
                <ul className="space-y-1">
                  {orderDetails.order.items.map((item: any, index: number) => (
                    <li key={index} className="text-sm bg-white p-2 rounded">
                      <strong>{item.product.name}</strong>
                      {item.variant && <span> ({item.variant.name})</span>}
                      <span> - Quantity: {item.quantity}</span>
                      <span> - Price: Rp {item.price.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={fulfillOrder}
              disabled={loading || !orderId.trim()}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Processing...' : '🚀 Test Stock Reduction (Fulfill Order)'}
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="text-lg font-semibold mb-2">
                  {result.success ? '✅ Success!' : '❌ Failed'}
                </h3>
                <p className="mb-3">{result.message}</p>
              </div>

              {result.stockBefore && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">📊 Stock Changes</h4>
                  <div className="space-y-2">
                    {result.stockBefore.map((item: any, index: number) => {
                      const afterItem = result.stockAfter[index];
                      return (
                        <div key={index} className="bg-white p-3 rounded border">
                          <p><strong>{item.name}</strong> ({item.type})</p>
                          <p>
                            Stock: {item.stockBefore} → {afterItem.stockAfter} 
                            <span className="text-sm text-gray-600">
                              (reduced by {item.quantityToReduce})
                            </span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {result.fulfillmentResult && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">🔧 Technical Details</h4>
                  <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(result.fulfillmentResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 How to Use This Test</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Go to Prisma Studio (http://localhost:5555)</li>
              <li>2. Check the "Order" table for your order ID</li>
              <li>3. Note the current stock levels in "Product" and "Variant" tables</li>
              <li>4. Enter your Order ID above and click "Check Order"</li>
              <li>5. Click "Test Stock Reduction" to simulate payment success</li>
              <li>6. Verify stock levels decreased in Prisma Studio</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
