"use client";

import Layout from "../../components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose lg:prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600">
              We collect information that you provide directly to us, including when you create an account, 
              make a purchase, sign up for our newsletter, or contact us for support.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
              <li>Process your orders and payments</li>
              <li>Send you order confirmations and updates</li>
              <li>Respond to your comments and questions</li>
              <li>Send you marketing communications (if you opt in)</li>
              <li>Improve our website and products</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600">
              We do not sell or rent your personal information to third parties. We may share your 
              information with service providers who assist us in operating our website, conducting our 
              business, or serving our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about our Privacy Policy, please contact us at privacy@teeclub.com
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}