"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

const Layout = dynamicImport(() => import("@/components/Layout"), { ssr: false });

export const dynamic = "force-dynamic";

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="mx-auto max-w-2xl p-6 text-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">Payment Pending</h1>

        <p className="mb-6 text-gray-600">
          Your payment is being processed. Please complete the payment according to the instructions
          provided.
          {orderId && (
            <span className="mt-2 block">
              Order ID: <span className="font-medium">{orderId}</span>
            </span>
          )}
        </p>

        <div className="flex flex-col space-y-4">
          <Link href="/shop">
            <button className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentPendingContent />
      </Suspense>
    </Layout>
  );
}