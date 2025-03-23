"use client";

import Layout from "../../components/Layout";

export default function Shop() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shop</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Shop content will go here */}
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </Layout>
  );
}