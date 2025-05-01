"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import { Suspense } from "react";

const Layout = dynamicImport(() => import("@/components/Layout"), { ssr: false });

export const dynamic = "force-dynamic";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const [isClient, setIsClient] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setIsLoading(true);

    try {
      const urlOrderId = searchParams.get("order_id");
      const urlTransactionStatus = searchParams.get("transaction_status");

      console.log("Payment success page - URL params:", {
        orderId: urlOrderId,
        transactionStatus: urlTransactionStatus,
      });

      let finalOrderId = urlOrderId;
      if (!finalOrderId && typeof window !== "undefined") {
        finalOrderId = localStorage.getItem("pending_order_id");
        console.log("Payment success page - Using order ID from localStorage:", finalOrderId);
      }

      setOrderId(finalOrderId);
      setTransactionStatus(urlTransactionStatus);
    } catch (err) {
      console.error("Payment success page - Error initializing:", err);
      setError("Failed to initialize payment success page");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isClient || !orderId) return;

    try {
      console.log("Payment success page - Processing order:", orderId);
      console.log("Payment success page - Transaction status:", transactionStatus);

      if (
        transactionStatus === "settlement" ||
        transactionStatus === "capture" ||
        localStorage.getItem("pending_order_id")
      ) {
        console.log("Payment success page - Clearing cart");
        clearCart();

        localStorage.removeItem("pending_order_id");
        localStorage.removeItem("payment_auth_token");
        console.log("Payment success page - Cleared payment auth token");
      }
    } catch (err) {
      console.error("Payment success page - Error processing payment:", err);
      setError("Failed to process payment confirmation");
    }
  }, [isClient, orderId, transactionStatus, clearCart]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl p-6 text-center">
      {isLoading ? (
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="flex h-32 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      ) : error ? (
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

          <h1 className="mb-4 text-2xl font-bold text-gray-900">Something went wrong</h1>

          <p className="mb-6 text-gray-600">{error}</p>

          <div className="flex flex-col space-y-4">
            <Link href="/shop">
              <button className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700">
                Return to Shop
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">Payment Successful!</h1>

          <p className="mb-6 text-gray-600">
            Thank you for your purchase. Your order has been successfully processed.
            {orderId && (
              <span className="mt-2 block">
                Order ID: <span className="font-medium">{orderId}</span>
              </span>
            )}
          </p>

          <div className="flex flex-col space-y-4">
            <button
              onClick={() => {
                if (orderId) {
                  const orderData = {
                    id: orderId,
                    timestamp: Date.now(),
                  };
                  localStorage.setItem("pending_order_id", orderId);
                  localStorage.setItem("pending_order_data", JSON.stringify(orderData));
                  console.log("Payment success - Stored order data for orders page:", orderData);
                }
                const baseUrl = window.location.origin;
                const ordersUrl = `${baseUrl}/orders`;
                console.log("Payment success - Redirecting to:", ordersUrl);

                setTimeout(() => {
                  window.location.href = ordersUrl;
                }, 100);
              }}
              className="mb-2 w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700"
            >
              View My Order
            </button>
            <button
              onClick={() => {
                const baseUrl = window.location.origin;
                const shopUrl = `${baseUrl}/shop`;
                console.log("Payment success - Redirecting to shop:", shopUrl);
                window.location.href = shopUrl;
              }}
              className="w-full rounded-md bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition duration-300 hover:bg-gray-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </Layout>
  );
}