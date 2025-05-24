"use client";

import React, { useState } from 'react';
import { getActiveSessionsCount, listActiveSessions } from '@/lib/checkout-session';

export default function OrderFlowTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCheckoutFlow = async () => {
    setLoading(true);
    try {
      // Simulate a checkout request
      const checkoutData = {
        items: [
          {
            productId: "41a30206-5bdf-4a55-a6a9-806561844931", // Classic White Tee from seed
            quantity: 2,
            variantId: undefined
          }
        ],
        shippingDetails: {
          name: "Test User",
          email: "test@example.com",
          phone: "08123456789",
          address: "Test Address 123",
          city: "Jakarta",
          postalCode: "12345"
        },
        paymentMethod: "credit_card"
      };

      console.log('Testing checkout flow with data:', checkoutData);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      });

      if (response.ok) {
        alert('✅ Checkout session created successfully! Check the results below.');
      } else {
        alert(`❌ Checkout failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Checkout test error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      alert('❌ Checkout test failed');
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!result?.data?.orderId) {
      alert('Please run checkout test first to get an order ID');
      return;
    }

    setLoading(true);
    try {
      // Simulate Midtrans webhook for successful payment
      const webhookPayload = {
        order_id: result.data.orderId,
        transaction_status: 'settlement',
        fraud_status: 'accept',
        transaction_id: `TXN-${Date.now()}`,
        gross_amount: '598000.00', // 2 x 299000
        currency: 'IDR',
        payment_type: 'credit_card'
      };

      console.log('Simulating payment success with payload:', webhookPayload);

      const response = await fetch('/api/midtrans/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      const data = await response.json();
      
      const paymentResult = {
        success: response.ok,
        status: response.status,
        data,
        webhookPayload,
        timestamp: new Date().toISOString()
      };

      setResult(prev => ({
        ...prev,
        paymentResult
      }));

      if (response.ok) {
        alert('✅ Payment simulation successful! Order should be created with PAID status.');
      } else {
        alert(`❌ Payment simulation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Payment simulation error:', error);
      alert('❌ Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 New Order Flow Test
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">New Order Flow Logic:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. ✅ User goes to checkout → Checkout session created (NO order yet)</li>
              <li>2. ✅ Payment gateway processes payment</li>
              <li>3. ✅ Payment success webhook → Order created with PAID status</li>
              <li>4. ✅ Stock reduced automatically during order creation</li>
              <li>5. ✅ Only PAID orders appear in orders page</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={testCheckoutFlow}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Testing...' : '1️⃣ Test Checkout (Create Session)'}
              </button>
              
              <button
                onClick={simulatePaymentSuccess}
                disabled={loading || !result?.data?.orderId}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Processing...' : '2️⃣ Simulate Payment Success'}
              </button>
            </div>

            {result && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className="text-lg font-semibold mb-2">
                    {result.success ? '✅ Checkout Test Result' : '❌ Checkout Test Failed'}
                  </h3>
                  <p className="text-sm mb-2">Status: {result.status}</p>
                  {result.data?.orderId && (
                    <p className="text-sm mb-2">
                      <strong>Order ID:</strong> {result.data.orderId}
                    </p>
                  )}
                </div>

                {result.paymentResult && (
                  <div className={`p-4 rounded-lg ${result.paymentResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <h3 className="text-lg font-semibold mb-2">
                      {result.paymentResult.success ? '✅ Payment Simulation Result' : '❌ Payment Simulation Failed'}
                    </h3>
                    <p className="text-sm mb-2">Status: {result.paymentResult.status}</p>
                    {result.paymentResult.data?.orderId && (
                      <p className="text-sm mb-2">
                        <strong>Created Order ID:</strong> {result.paymentResult.data.orderId}
                      </p>
                    )}
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">🔧 Technical Details</h4>
                  <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Verification Steps</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Run "Test Checkout" → Should create checkout session (no order in DB yet)</li>
              <li>2. Check Prisma Studio → Order table should be empty</li>
              <li>3. Run "Simulate Payment Success" → Should create order with PAID status</li>
              <li>4. Check Prisma Studio → Order should appear with PAID status</li>
              <li>5. Check Product stock → Should be reduced by 2 (from 50 to 48)</li>
              <li>6. Visit /orders page → Should show the new PAID order</li>
            </ol>
          </div>

          <div className="mt-6 flex gap-4">
            <a
              href="http://localhost:5555"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              🗄️ Open Prisma Studio
            </a>
            <a
              href="/orders"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              📋 View Orders Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
