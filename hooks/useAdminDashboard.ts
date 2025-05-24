"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminDashboardResponse, AdminOrdersResponse, AdminProductsResponse } from "@/types/admin";

interface UseAdminDashboardReturn {
  dashboardData: AdminDashboardResponse["data"] | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("useAdminDashboard: Fetching dashboard data");

      const response = await fetch("/api/admin/dashboard", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Prevent caching issues
      });

      console.log("useAdminDashboard: Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("useAdminDashboard: Server error details:", errorData);
        } catch (parseError) {
          console.error("useAdminDashboard: Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data: AdminDashboardResponse = await response.json();

      if (data.success && data.data) {
        setDashboardData(data.data);
        console.log("useAdminDashboard: Dashboard data loaded successfully", {
          stats: data.data.stats,
          recentOrdersCount: data.data.recentOrders?.length || 0,
          lowStockProductsCount: data.data.lowStockProducts?.length || 0,
          recentCustomersCount: data.data.recentCustomers?.length || 0,
        });
      } else {
        throw new Error("Invalid response format or missing data");
      }
    } catch (err) {
      console.error("useAdminDashboard: Error fetching dashboard data:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);

      // Don't clear existing data on error to prevent UI flashing
      // setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard,
  };
}

interface UseAdminOrdersOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAdminOrdersReturn {
  ordersData: AdminOrdersResponse["data"] | null;
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<boolean>;
}

export function useAdminOrders(options: UseAdminOrdersOptions = {}): UseAdminOrdersReturn {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [ordersData, setOrdersData] = useState<AdminOrdersResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (status) params.append("status", status);
      if (search) params.append("search", search);

      console.log("useAdminOrders: Fetching orders with params:", params.toString());

      const response = await fetch(`/api/admin/orders?${params}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const data: AdminOrdersResponse = await response.json();

      if (data.success) {
        setOrdersData(data.data);
        console.log(`useAdminOrders: Loaded ${data.data.orders.length} orders`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("useAdminOrders: Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search, sortBy, sortOrder]);

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: string): Promise<boolean> => {
      try {
        console.log(`useAdminOrders: Updating order ${orderId} status to ${newStatus}`);

        const response = await fetch("/api/admin/orders", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            status: newStatus,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update order status");
        }

        const data = await response.json();

        if (data.success) {
          // Refresh orders to get updated data
          await fetchOrders();
          console.log(`useAdminOrders: Order ${orderId} status updated successfully`);
          return true;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("useAdminOrders: Error updating order status:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      }
    },
    [fetchOrders]
  );

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOrders]);

  return {
    ordersData,
    loading,
    error,
    refreshOrders,
    updateOrderStatus,
  };
}

interface UseAdminProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

interface UseAdminProductsReturn {
  productsData: AdminProductsResponse["data"] | null;
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  createProduct: (productData: any) => Promise<boolean>;
  updateProduct: (id: string, productData: any) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
}

export function useAdminProducts(options: UseAdminProductsOptions = {}): UseAdminProductsReturn {
  const {
    page = 1,
    limit = 10,
    search,
    lowStock,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const [productsData, setProductsData] = useState<AdminProductsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (lowStock) params.append("lowStock", "true");

      console.log("useAdminProducts: Fetching products with params:", params.toString());

      const response = await fetch(`/api/admin/products?${params}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch products");
      }

      const data: AdminProductsResponse = await response.json();

      if (data.success) {
        setProductsData(data.data);
        console.log(`useAdminProducts: Loaded ${data.data.products.length} products`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("useAdminProducts: Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, lowStock, sortBy, sortOrder]);

  const createProduct = useCallback(
    async (productData: any): Promise<boolean> => {
      try {
        console.log("useAdminProducts: Creating new product");

        const response = await fetch("/api/admin/products", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create product");
        }

        const data = await response.json();

        if (data.success) {
          // Refresh products to include the new one
          await fetchProducts();
          console.log("useAdminProducts: Product created successfully");
          return true;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("useAdminProducts: Error creating product:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      }
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (id: string, productData: any): Promise<boolean> => {
      try {
        console.log(`useAdminProducts: Updating product ${id}`);

        const response = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update product");
        }

        const data = await response.json();

        if (data.success) {
          // Refresh products to get updated data
          await fetchProducts();
          console.log(`useAdminProducts: Product ${id} updated successfully`);
          return true;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("useAdminProducts: Error updating product:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      }
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        console.log(`useAdminProducts: Deleting product ${id}`);

        const response = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete product");
        }

        const data = await response.json();

        if (data.success) {
          // Refresh products to remove the deleted one
          await fetchProducts();
          console.log(`useAdminProducts: Product ${id} deleted successfully`);
          return true;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("useAdminProducts: Error deleting product:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      }
    },
    [fetchProducts]
  );

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    productsData,
    loading,
    error,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
