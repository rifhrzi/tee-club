"use client";

import Layout from "../../components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
        <div className="prose lg:prose-lg">
          <p className="text-gray-600">
            Welcome to Tee Club, where style meets comfort. We are passionate about creating premium quality t-shirts that not only look great but feel amazing to wear.
          </p>
          <p className="text-gray-600 mt-4">
            Our commitment to quality and sustainability drives everything we do, from selecting the finest materials to ensuring ethical manufacturing practices.
          </p>
        </div>
      </div>
    </Layout>
  );
}