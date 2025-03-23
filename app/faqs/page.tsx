"use client";

import Layout from "../../components/Layout";

export default function FAQs() {
  const faqs = [
    {
      question: "What materials do you use for your t-shirts?",
      answer: "We use premium 100% organic cotton for all our t-shirts, ensuring both comfort and sustainability."
    },
    {
      question: "How do I care for my t-shirt?",
      answer: "We recommend washing in cold water and tumble drying on low to maintain the quality and fit of your t-shirt."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unworn items in original packaging. Contact us for more details."
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}