"use client";

import Layout from "../../components/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose lg:prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600">
              By accessing or using our website, you agree to be bound by these Terms of Service. If you 
              disagree with any part of these terms, you may not access our website or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Purchases</h2>
            <p className="text-gray-600">
              All purchases through our site are subject to our product availability. We reserve the right 
              to refuse any order placed through our site.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
              <li>All prices are subject to change without notice</li>
              <li>We reserve the right to limit the quantities of any products</li>
              <li>All descriptions of products are subject to change at any time without notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Returns & Refunds</h2>
            <p className="text-gray-600">
              We offer a 30-day return policy for unworn items in original packaging. To be eligible for a 
              return, your item must be unused and in the same condition that you received it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-600">
              The Service and its original content, features, and functionality are and will remain the 
              exclusive property of Tee Club. Our trademarks and trade dress may not be used in connection 
              with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600">
              Questions about the Terms of Service should be sent to us at terms@teeclub.com
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}