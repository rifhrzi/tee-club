"use client";

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import PageLoader from '@/components/PageLoader';
import { useAuth } from '@/components/AuthProvider';

export default function LoadingDemoPage() {
  const [showDemo, setShowDemo] = useState<string | null>(null);
  const auth = useAuth();

  const demos = [
    {
      id: 'skeleton',
      title: 'Skeleton Loading',
      description: 'Content placeholder while data loads',
      component: <PageLoader variant="skeleton" fullScreen={false} />
    },
    {
      id: 'minimal',
      title: 'Minimal Loader',
      description: 'Simple spinner for small components',
      component: <PageLoader variant="minimal" message="Loading data..." />
    },
    {
      id: 'branded',
      title: 'Branded Loader',
      description: 'Full Tee Club branded loading experience',
      component: <PageLoader variant="branded" message="Loading your content..." fullScreen={false} />
    },
    {
      id: 'default',
      title: 'Default Loader',
      description: 'Standard loading animation',
      component: <PageLoader variant="default" message="Please wait..." showLogo={true} />
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎨 Loading Animation Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Test different loading states and animations used throughout the Tee Club application.
          </p>
        </div>

        {/* Auth Status Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">Current Auth State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Authenticated:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                auth.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {auth.isAuthenticated ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Loading:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                auth.isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {auth.isLoading ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Initialized:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                auth.isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {auth.isInitialized ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">User:</span>
              <span className="ml-2 text-xs text-gray-600">
                {auth.user?.email || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setShowDemo(showDemo === demo.id ? null : demo.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                showDemo === demo.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-1">{demo.title}</h3>
              <p className="text-sm text-gray-600">{demo.description}</p>
            </button>
          ))}
        </div>

        {/* Demo Display Area */}
        {showDemo && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {demos.find(d => d.id === showDemo)?.title} Demo
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {demos.find(d => d.id === showDemo)?.description}
              </p>
            </div>
            <div className="p-6">
              {demos.find(d => d.id === showDemo)?.component}
            </div>
          </div>
        )}

        {/* Auth Guard Demo */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">🛡️ Auth Guard Demo</h3>
          <p className="text-gray-600 mb-4">
            This section demonstrates how AuthGuard protects content and shows loading states.
          </p>
          
          <AuthGuard 
            requireAuth={true} 
            redirectTo="/login?demo=true"
            loadingMessage="Checking access permissions..."
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">🎉 Protected Content</h4>
              <p className="text-green-700">
                You can see this content because you're authenticated! This area is protected by AuthGuard.
              </p>
              <div className="mt-3 text-sm text-green-600">
                <strong>User:</strong> {auth.user?.name || auth.user?.email}
              </div>
            </div>
          </AuthGuard>
        </div>

        {/* Usage Examples */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📖 Usage Examples</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900">App-wide Auth Loading:</h4>
              <p className="text-gray-600">Automatically shown during NextAuth session initialization in root layout.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Page-level Protection:</h4>
              <p className="text-gray-600">Wrap pages with AuthGuard to require authentication and show loading states.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Component Loading:</h4>
              <p className="text-gray-600">Use PageLoader variants for different loading scenarios within components.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Navigation Loading:</h4>
              <p className="text-gray-600">Skeleton loaders prevent layout shift during client-side navigation.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
