"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  PrinterIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import OrderItemCard from "@/components/order/OrderItemCard";
import RefundModal from "@/components/order/RefundModal";
import OrderSummaryCard from "@/components/order/OrderSummaryCard";
import ShippingInfoCard from "@/components/order/ShippingInfoCard";
import PaymentInfoCard from "@/components/order/PaymentInfoCard";

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import("@/components/Layout"), { ssr: false });

// Order status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUND_REQUESTED":
        return "bg-orange-100 text-orange-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "REFUND_REQUESTED":
        return "Refund Requested";
      case "REFUNDED":
        return "Refunded";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor()}`}
    >
      {getStatusText()}
    </span>
  );
};

// Order type definition
interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  paymentToken?: string;
  shippingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
    variant?: {
      id: string;
      name: string;
    };
  }[];
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    // Only run on client side
    const isClient = typeof window !== "undefined";
    if (!isClient) return;

    // Debug authentication state
    console.log("Order Detail Page - Auth state:", {
      status,
      isAuthenticated: status === "authenticated",
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          }
        : null,
    });

    // Only redirect if we're definitely not authenticated (not during loading)
    if (status === "unauthenticated") {
      console.log("Order detail page requires authentication, redirecting to login");
      router.push(`/login?redirect=/orders/${params.id}`);
      return;
    }

    if (status === "loading") {
      console.log("Authentication status is loading, waiting...");
      return;
    }

    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log("Order Detail Page - Fetching order details for ID:", params.id);

        // Prepare headers
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        // Add user ID header for debugging
        if (session?.user?.id) {
          headers["x-nextauth-user-id-debug"] = session.user.id;
        }

        // Log all cookies for debugging
        console.log("Order Detail Page - Cookies before API request:");
        document.cookie.split(";").forEach((cookie) => {
          console.log("  ", cookie.trim());
        });

        // NextAuth session is automatically included via cookies
        const response = await fetch(`/api/orders/${params.id}`, {
          headers,
          credentials: "include", // This ensures cookies are sent with the request
        });

        console.log("Order Detail Page - API response status:", response.status);

        if (!response.ok) {
          // Try to parse error response
          try {
            const errorData = await response.json();
            console.error("Order Detail Page - API error:", errorData);
            throw new Error(errorData.message || "Failed to fetch order details");
          } catch (parseError) {
            console.error("Order Detail Page - Error parsing error response:", parseError);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
        }

        const data = await response.json();
        console.log("Order Detail Page - Order data received successfully");
        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load order details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [status, session, router, params.id]);

  // Handle refund request
  const handleRefundRequest = async (reason: string) => {
    try {
      setRefundLoading(true);

      const response = await fetch(`/api/orders/${params.id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process refund request");
      }

      // Update order status locally
      if (order) {
        setOrder({
          ...order,
          status: "REFUND_REQUESTED",
        });
      }

      setShowRefundModal(false);
      setToastMessage(
        "Refund request submitted successfully. We will process it within 3-5 business days."
      );
      setToastType("success");
      setShowToast(true);

      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.error("Refund request error:", error);
      setToastMessage(error instanceof Error ? error.message : "Failed to submit refund request");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <Layout>
      {/* Toast Notifications */}
      {showToast && <Toast message={toastMessage} type={toastType} />}

      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onConfirm={handleRefundRequest}
        orderTotal={order?.totalAmount || 0}
        orderId={params.id}
        isLoading={refundLoading}
      />

      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/orders"
              className="mb-4 inline-flex items-center font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="large" text="Loading order details..." />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-red-200 bg-red-50 p-6"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-900">Error Loading Order</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          ) : !order ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-gray-200 bg-white py-20 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-900">Order Not Found</h3>
              <p className="text-gray-600">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Order Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                      Order #{order.id.substring(0, 8)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={order.status} />
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      {order.status === "PROCESSING" && (
                        <button
                          onClick={() => setShowRefundModal(true)}
                          className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-700"
                        >
                          <ArrowUturnLeftIcon className="mr-2 h-4 w-4" />
                          Request Refund
                        </button>
                      )}
                      {order.status === "PENDING" && (
                        <Link href={`/payment/${order.id}`}>
                          <button className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700">
                            <CheckCircleIcon className="mr-2 h-4 w-4" />
                            Complete Payment
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                      >
                        <PrinterIcon className="mr-2 h-4 w-4" />
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Status Timeline */}
              <OrderStatusTimeline
                currentStatus={order.status}
                orderDate={order.createdAt}
                estimatedDelivery={undefined} // You can add this field to your order model
              />

              {/* Order Items */}
              <div>
                <h3 className="mb-6 text-xl font-semibold text-gray-900">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <OrderItemCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>

              {/* Two Column Layout for Details */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column - Shipping and Payment Info */}
                <div className="space-y-8 lg:col-span-2">
                  <ShippingInfoCard
                    shippingDetails={order.shippingDetails}
                    trackingNumber={undefined} // You can add this field to your order model
                    estimatedDelivery={undefined} // You can add this field to your order model
                    shippingMethod="Standard Shipping"
                  />

                  <PaymentInfoCard
                    paymentMethod={order.paymentMethod}
                    paymentStatus={order.status === "PENDING" ? "pending" : "paid"}
                    totalAmount={order.totalAmount}
                    transactionId={order.paymentToken}
                    paymentDate={order.createdAt}
                    billingAddress={undefined} // You can add this field to your order model
                  />
                </div>

                {/* Right Column - Order Summary */}
                <div>
                  <OrderSummaryCard
                    subtotal={order.totalAmount}
                    shipping={0}
                    tax={0}
                    discount={0}
                    total={order.totalAmount}
                    paymentMethod={order.paymentMethod}
                    paymentStatus={order.status === "PENDING" ? "pending" : "paid"}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
