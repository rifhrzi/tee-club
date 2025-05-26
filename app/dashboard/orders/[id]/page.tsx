"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { OrderHeader } from "@/components/dashboard/OrderHeader";
import { CustomerInfo } from "@/components/dashboard/CustomerInfo";
import { ShippingInfo } from "@/components/dashboard/ShippingInfo";
import { OrderItems } from "@/components/dashboard/OrderItems";
import { OrderSummary } from "@/components/dashboard/OrderSummary";

interface DatabaseOrder {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
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
  }>;
  shippingDetails?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  paymentDetails?: {
    method: string;
    status: string;
    transactionId?: string;
  };
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, user, isReady } = useUnifiedAuth();
  const [order, setOrder] = useState<DatabaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("");

  // Fetch order data from API
  useEffect(() => {
    const fetchOrder = async () => {
      if (!isReady || !isAuthenticated || user?.role !== "ADMIN") {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/orders/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Order not found");
          } else if (response.status === 403) {
            throw new Error("Access denied - Admin privileges required");
          } else {
            throw new Error(`Failed to fetch order: ${response.status}`);
          }
        }

        const data = await response.json();
        setOrder(data.order);
        setOrderStatus(data.order.status);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, isAuthenticated, user, isReady]);

  // Handle authentication
  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard&message=admin-required");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/login?redirect=/dashboard&message=admin-required");
      return;
    }
  }, [isAuthenticated, user, router, isReady]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const data = await response.json();
      setOrderStatus(newStatus);
      setOrder(data.data);
      console.log("Order status updated successfully:", newStatus);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    }
  };

  // Show loading state while auth is being determined
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md p-6 text-center">
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <h2 className="mb-2 text-lg font-bold">Access Denied</h2>
            <p className="mb-2">You need administrator privileges to access this page.</p>
          </div>
          <button
            onClick={() => router.push("/login?redirect=/dashboard&message=admin-required")}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Login as Administrator
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching order
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-64 rounded bg-gray-300"></div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="h-64 rounded-lg bg-gray-300"></div>
                <div className="h-48 rounded-lg bg-gray-300"></div>
                <div className="h-96 rounded-lg bg-gray-300"></div>
              </div>
              <div className="h-64 rounded-lg bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-red-800">Error Loading Order</h2>
            <p className="text-red-700">{error}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no order found
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <h2 className="mb-2 text-lg font-bold text-gray-800">Order Not Found</h2>
            <p className="text-gray-600">The requested order could not be found.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Transform database order to component format
  const transformedOrder = {
    id: order.id,
    orderDate: new Date(order.createdAt),
    status: order.status,
    customer: {
      name: order.user.name,
      email: order.user.email,
      phone: order.shippingDetails?.phone || "",
      address: {
        street: order.shippingDetails?.address || "",
        city: order.shippingDetails?.city || "",
        state: "",
        postalCode: order.shippingDetails?.postalCode || "",
        country: "Indonesia",
      },
    },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      size: item.variant?.name || "Standard",
      quantity: item.quantity,
      price: item.price,
      image: item.product.images[0] || "/placeholder-image.svg",
    })),
    shipping: {
      method: "Standard Shipping",
      trackingNumber: "",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      cost: 0,
    },
    payment: {
      method: order.paymentDetails?.method || "Unknown",
      status: order.paymentDetails?.status || "Unknown",
      proof: "",
    },
    subtotal: order.totalAmount,
    discount: 0,
    total: order.totalAmount,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <OrderHeader
          order={transformedOrder}
          orderStatus={orderStatus}
          onStatusChange={handleStatusChange}
          onBack={() => router.push("/dashboard")}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <CustomerInfo customer={transformedOrder.customer} />
            <ShippingInfo shipping={transformedOrder.shipping} />
            <OrderItems items={transformedOrder.items} />
          </div>
          <div>
            <OrderSummary order={transformedOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}
