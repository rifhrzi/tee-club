"use client";

import React, { useState, useEffect } from "react";
import { AdminOrder, OrderStatus } from "@/types/admin";
import { useAdminOrders } from "@/hooks/useAdminDashboard";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import Link from "next/link";

interface OrderManagementTableProps {
  className?: string;
}

export default function OrderManagementTable({ className = "" }: OrderManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalAmount" | "status">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const { ordersData, loading, error, refreshOrders, updateOrderStatus } = useAdminOrders({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
    autoRefresh: true, // Enable auto-refresh every 30 seconds
    refreshInterval: 30000,
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format order ID (last 8 characters)
  const formatOrderId = (id: string) => {
    return `#${id.slice(-8).toUpperCase()}`;
  };

  // Show toast notification
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sort
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle status filter
  const handleStatusFilter = (status: OrderStatus | "") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (success) {
        showNotification(`Order status updated to ${newStatus.toLowerCase()}!`);
      } else {
        showNotification("Failed to update order status. Please try again.", "error");
      }
    } catch (error) {
      console.error("Update order status error:", error);
      showNotification("An error occurred while updating status. Please try again.", "error");
    }
  };

  // Get status styling
  const getStatusStyle = (status: OrderStatus) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Get status display text
  const getStatusText = (status: OrderStatus) => {
    const texts = {
      PENDING: "Pending",
      PAID: "Paid",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return texts[status] || status;
  };

  if (error) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">Error Loading Orders</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={refreshOrders}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showToast && <Toast message={toastMessage} type={toastType} />}

      <div className={`rounded-lg bg-white shadow ${className}`}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
              <p className="text-sm text-gray-600">
                Monitor and manage customer orders with real-time updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                <i className="fas fa-sync-alt mr-1"></i>
                Auto-refresh: 30s
              </span>
              <button
                onClick={refreshOrders}
                className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                disabled={loading}
              >
                <i className={`fas fa-sync-alt mr-1 ${loading ? "animate-spin" : ""}`}></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search orders by ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | "")}
                className="rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" text="Loading orders..." />
            </div>
          ) : !ordersData?.orders.length ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-400">
                <i className="fas fa-shopping-cart text-4xl"></i>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No Orders Found</h3>
              <p className="mb-4 text-gray-600">
                {searchTerm || statusFilter
                  ? "No orders match your current filters."
                  : "No orders have been placed yet."}
              </p>
              {(searchTerm || statusFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setCurrentPage(1);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Order ID
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Customer
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Status
                      <i
                        className={`fas fa-sort ${
                          sortBy === "status"
                            ? sortOrder === "asc"
                              ? "fa-sort-up"
                              : "fa-sort-down"
                            : ""
                        }`}
                      ></i>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("totalAmount")}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Total
                      <i
                        className={`fas fa-sort ${
                          sortBy === "totalAmount"
                            ? sortOrder === "asc"
                              ? "fa-sort-up"
                              : "fa-sort-down"
                            : ""
                        }`}
                      ></i>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Date
                      <i
                        className={`fas fa-sort ${
                          sortBy === "createdAt"
                            ? sortOrder === "asc"
                              ? "fa-sort-up"
                              : "fa-sort-down"
                            : ""
                        }`}
                      ></i>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ordersData.orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatOrderId(order.id)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod && (
                          <span className="capitalize">
                            {order.paymentMethod.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                      {order.shippingDetails && (
                        <div className="text-xs text-gray-400">{order.shippingDetails.city}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order.id, e.target.value as OrderStatus)
                            }
                            className="rounded border border-gray-300 px-1 py-0.5 text-xs focus:border-transparent focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      {order.items.length > 0 && (
                        <div className="text-xs text-gray-400">
                          {order.items[0].product.name}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-blue-600 transition-colors hover:text-blue-900"
                          title="View Order Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        {order.shippingDetails && (
                          <button
                            onClick={() => {
                              // Copy shipping address to clipboard
                              const address = `${order.shippingDetails!.name}\n${
                                order.shippingDetails!.address
                              }\n${order.shippingDetails!.city} ${
                                order.shippingDetails!.postalCode
                              }\n${order.shippingDetails!.phone}`;
                              navigator.clipboard.writeText(address);
                              showNotification("Shipping address copied to clipboard!");
                            }}
                            className="text-gray-600 transition-colors hover:text-gray-900"
                            title="Copy Shipping Address"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {ordersData && ordersData.pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(ordersData.pagination.page - 1) * ordersData.pagination.limit + 1} to{" "}
                {Math.min(
                  ordersData.pagination.page * ordersData.pagination.limit,
                  ordersData.pagination.total
                )}{" "}
                of {ordersData.pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, ordersData.pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`rounded-md px-3 py-1 text-sm transition-colors ${
                          page === currentPage
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === ordersData.pagination.totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
