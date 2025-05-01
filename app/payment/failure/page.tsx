"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamicImport(() => import("@/components/Layout"), { ssr: false });

export const dynamic = "force-dynamic"; // Force dynamic rendering

// Separate component for content using useSearchParams
function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const transactionStatus = searchParams.get("transaction_status");
  const statusMessage = searchParams.get("status_message");

  return (
    <div className="mx-auto max-w-2xl p-6 text-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">Payment Failed</h1>

        <p className="mb-6 text-gray-600">
          We're sorry, but there was an issue processing your payment.
          {statusMessage && (
            <span className="mt-2 block text-red-600">Reason: {statusMessage}</span>
          )}
          {orderId && (
            <span className="mt-2 block">
              Order ID: <span className="font-medium">{orderId}</span>
            </span>
          )}
        </p>

        <div className="flex flex-col space-y-4">
          <Link href="/cart">
            <button className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700">
              Return to Cart
            </button>
          </Link>
          <Link href="/shop">
            <button className="w-full rounded-md bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition duration-300 hover:bg-gray-300">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentFailureContent />
      </Suspense>
    </Layout>
  );
}
