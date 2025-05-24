"use client";

import React, { useState } from 'react';

export default function WebhookTestPage() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulateWebhook = async () => {
    if (!orderId.trim()) {
      alert('Please enter an Order ID');
      return;
    }

    setLoading(true);
    try {
      // Simulate Midtrans webhook notification
      const webhookPayload = {
        order_id: orderId,
        transaction_status: 'settlement',
        fraud_status: 'accept',
        transaction_id: `TXN-${Date.now()}`,
        gross_amount: '399000.00',
        currency: 'IDR',
        payment_type: 'credit_card'
      };

      console.log('Simulating webhook with payload:', webhookPayload);

      const response = await fetch('/api/midtrans/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      const data = await response.json();
      setResult({
        success: response.ok,
        status: response.status,
        data,
        webhookPayload
      });
      
      if (response.ok) {
        alert('Webhook simulation successful! Check the results below and verify stock in Prisma Studio.');
      } else {
        alert(`Webhook simulation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to simulate webhook');
      console.error(error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔗 Webhook Simulation Test
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What This Test Does:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Simulates a successful Midtrans payment webhook</li>
              <li>• Triggers your webhook handler at /api/midtrans/notification</li>
              <li>• Tests the complete stock reduction flow</li>
              <li>• Updates order status to PAID</li>
              <li>• Reduces stock for all items in the order</li>
            </ul>
          </div>
          
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
                onClick={simulateWebhook}
                disabled={loading || !orderId.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Simulating...' : '🚀 Simulate Payment Success'}
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="text-lg font-semibold mb-2">
                  {result.success ? '✅ Webhook Simulation Successful!' : '❌ Webhook Simulation Failed'}
                </h3>
                <p className="text-sm">Status Code: {result.status}</p>
                {result.error && <p className="text-red-600 mt-2">{result.error}</p>}
              </div>

              {result.webhookPayload && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">📤 Webhook Payload Sent</h4>
                  <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(result.webhookPayload, null, 2)}
                  </pre>
                </div>
              )}

              {result.data && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">📥 Webhook Response</h4>
                  <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Testing Checklist</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. ✅ Check current stock in Prisma Studio (Product & Variant tables)</li>
              <li>2. ✅ Find your Order ID in the Order table</li>
              <li>3. ✅ Note the order status (should be PENDING)</li>
              <li>4. ✅ Run the webhook simulation above</li>
              <li>5. ✅ Check order status changed to PAID in Prisma Studio</li>
              <li>6. ✅ Verify stock levels decreased in Product/Variant tables</li>
              <li>7. ✅ Check terminal logs for fulfillment messages</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🎯 Expected Results</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Order status changes from PENDING → PAID</li>
              <li>• Product stock decreases by ordered quantity</li>
              <li>• Variant stock decreases (if variants were ordered)</li>
              <li>• Console logs show "Successfully fulfilled order"</li>
              <li>• No error messages in terminal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
