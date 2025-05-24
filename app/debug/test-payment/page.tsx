"use client";

import React, { useState } from 'react';

export default function TestPaymentPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
      console.log('Test notification result:', data);
    } catch (error) {
      console.error('Test notification error:', error);
      setResult({ error: 'Failed to test notification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Test Payment Notification
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              This will simulate a Midtrans payment notification to test if our notification handler is working correctly.
            </p>

            <button
              onClick={testNotification}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Payment Notification'}
            </button>

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 What This Tests</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Sends a test payment notification to our handler</li>
                <li>• Simulates a successful payment (settlement status)</li>
                <li>• Tests order creation from checkout session</li>
                <li>• Verifies stock reduction logic</li>
                <li>• Checks if notification processing works end-to-end</li>
              </ul>
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href="/checkout"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                🛒 Try Real Checkout
              </a>
              <a
                href="http://localhost:5555"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                📊 View Database
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
