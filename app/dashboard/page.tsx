"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useAdminDashboard, useAdminOrders } from "@/hooks/useAdminDashboard";
import { AdminOrder, OrderStatus } from "@/types/admin";

export default function DashboardPage() {
  const { isAuthenticated, user, isReady } = useUnifiedAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real dashboard data
  const {
    dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refreshDashboard,
  } = useAdminDashboard();
  const {
    ordersData,
    loading: ordersLoading,
    error: ordersError,
    updateOrderStatus,
  } = useAdminOrders({
    page: 1,
    limit: 10,
    autoRefresh: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Debug logging
  useEffect(() => {
    console.log("Dashboard - Auth state:", {
      isAuthenticated,
      isReady,
      user,
      userRole: user?.role,
    });
  }, [isAuthenticated, isReady, user]);

  useEffect(() => {
    if (!isReady) {
      console.log("Dashboard - Auth not ready yet, waiting...");
      return;
    }

    if (!isAuthenticated) {
      console.log("Dashboard - User not authenticated, redirecting to login");
      router.push("/login?redirect=/dashboard&message=admin-required");
      return;
    }

    if (user?.role !== "ADMIN") {
      console.log("Dashboard - User role is not ADMIN:", user?.role, "redirecting to login");
      router.push("/login?redirect=/dashboard&message=admin-required");
      return;
    }

    console.log("Dashboard - Admin access granted for user:", user.email);
  }, [isAuthenticated, user, router, isReady]);

  // Show loading state while auth is being determined
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied message for non-admin users
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="mx-auto max-w-md p-6 text-center">
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <h2 className="mb-2 text-lg font-bold">Access Denied</h2>
            <p className="mb-2">You need administrator privileges to access this page.</p>
            <p className="text-sm">
              Current user: {user?.email || "Not logged in"}
              {user?.role && ` (Role: ${user.role})`}
            </p>
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

  // Format numbers for display
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change}%`;
  };

  // Generate stats from real data
  const stats = dashboardData
    ? [
        {
          name: "Total Pesanan",
          value: formatNumber(dashboardData.stats.totalOrders),
          change: formatChange(dashboardData.stats.ordersChange),
          changeColor: dashboardData.stats.ordersChange >= 0 ? "text-green-600" : "text-red-600",
        },
        {
          name: "Pendapatan",
          value: formatCurrency(dashboardData.stats.totalRevenue),
          change: formatChange(dashboardData.stats.revenueChange),
          changeColor: dashboardData.stats.revenueChange >= 0 ? "text-green-600" : "text-red-600",
        },
        {
          name: "Pelanggan Baru",
          value: formatNumber(dashboardData.stats.newCustomers),
          change: formatChange(dashboardData.stats.customersChange),
          changeColor: dashboardData.stats.customersChange >= 0 ? "text-green-600" : "text-red-600",
        },
        {
          name: "Produk Terjual",
          value: formatNumber(dashboardData.stats.productsSold),
          change: formatChange(dashboardData.stats.productsSoldChange),
          changeColor:
            dashboardData.stats.productsSoldChange >= 0 ? "text-green-600" : "text-red-600",
        },
      ]
    : [
        { name: "Total Pesanan", value: "0", change: "0%", changeColor: "text-gray-600" },
        { name: "Pendapatan", value: "Rp 0", change: "0%", changeColor: "text-gray-600" },
        { name: "Pelanggan Baru", value: "0", change: "0%", changeColor: "text-gray-600" },
        { name: "Produk Terjual", value: "0", change: "0%", changeColor: "text-gray-600" },
      ];

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear localStorage and redirect
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Dashboard */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
              >
                <div className="animate-pulse">
                  <div className="absolute h-12 w-12 rounded-md bg-gray-300 p-3"></div>
                  <div className="mb-2 ml-16 h-4 w-24 rounded bg-gray-300"></div>
                  <div className="ml-16 h-8 w-16 rounded bg-gray-300"></div>
                </div>
              </div>
            ))
          ) : dashboardError ? (
            // Error state
            <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-800">Error loading dashboard data: {dashboardError}</p>
              <button
                onClick={refreshDashboard}
                className="mt-2 text-red-600 underline hover:text-red-500"
              >
                Try again
              </button>
            </div>
          ) : (
            // Real data
            stats.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className="absolute rounded-md bg-blue-500 p-3">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeColor}`}
                  >
                    {stat.change}
                  </p>
                </dd>
              </div>
            ))
          )}
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {["overview", "orders", "products", "customers"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Pesanan Terbaru</h3>
                    <button
                      onClick={refreshDashboard}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {dashboardLoading ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-4"
                        >
                          <div className="animate-pulse">
                            <div className="mb-2 h-4 w-24 rounded bg-gray-300"></div>
                            <div className="h-3 w-16 rounded bg-gray-300"></div>
                          </div>
                          <div className="h-6 w-16 rounded-full bg-gray-300"></div>
                        </div>
                      ))
                    ) : dashboardData?.recentOrders.length ? (
                      dashboardData.recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between border-b pb-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Pesanan #{order.id.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.user.name} • {formatCurrency(order.totalAmount)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "SHIPPED"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "PROCESSING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "PAID"
                                      ? "bg-purple-100 text-purple-800"
                                      : order.status === "PENDING"
                                        ? "bg-gray-100 text-gray-800"
                                        : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-gray-500">Belum ada pesanan</p>
                    )}
                  </div>
                </div>

                {/* Low Stock Products */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900">Stok Rendah</h3>
                  <div className="mt-4 space-y-4">
                    {dashboardLoading ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-4"
                        >
                          <div className="animate-pulse">
                            <div className="mb-2 h-4 w-32 rounded bg-gray-300"></div>
                            <div className="h-3 w-20 rounded bg-gray-300"></div>
                          </div>
                          <div className="h-4 w-16 rounded bg-gray-300"></div>
                        </div>
                      ))
                    ) : dashboardData?.lowStockProducts.length ? (
                      dashboardData.lowStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between border-b pb-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-red-500">
                              Stok: {product.stock} unit
                              {product.stock === 0 && " (Habis)"}
                              {product.stock > 0 && product.stock < 5 && " (Sangat Rendah)"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(product.price)}
                            </span>
                            <p className="text-xs text-gray-500">
                              Terjual: {product._count?.orderItems || 0}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-gray-500">Semua produk stok aman</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Daftar Pesanan</h3>
                  <Link
                    href="/dashboard/orders/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Tambah Pesanan
                  </Link>
                </div>
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          ID Pesanan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Pelanggan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3].map((order) => (
                        <tr key={order}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            #{order}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            Pelanggan {order}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Selesai
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            Rp {formatNumber(1000000 + order * 100000)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <Link
                              href={`/dashboard/orders/${order}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Daftar Produk</h3>
                  <Link
                    href="/dashboard/products/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Tambah Produk
                  </Link>
                </div>
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Nama Produk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Stok
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Harga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3].map((product) => (
                        <tr key={product}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            Produk {product}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            Kategori {product}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {formatNumber(100 + product)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            Rp {formatNumber(100000 + product * 10000)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <Link
                              href={`/dashboard/products/${product}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Daftar Pelanggan</h3>
                  <Link
                    href="/dashboard/customers/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Tambah Pelanggan
                  </Link>
                </div>
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Total Pesanan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3].map((customer) => (
                        <tr key={customer}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            Pelanggan {customer}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            customer{customer}@example.com
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {formatNumber(5 + customer)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Aktif
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <Link
                              href={`/dashboard/customers/${customer}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
