"use client";

import React, { useState, useEffect } from "react";
import { AdminProduct } from "@/types/admin";
import { useAdminProducts } from "@/hooks/useAdminDashboard";
import ProductFormModal from "./ProductFormModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ProductImage from "./ProductImage";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { ProductInput } from "@/lib/validation";

interface ProductManagementTableProps {
  className?: string;
}

export default function ProductManagementTable({ className = "" }: ProductManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showLowStock, setShowLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const {
    productsData,
    loading,
    error,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProducts({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    lowStock: showLowStock,
    sortBy,
    sortOrder,
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
    });
  };

  // Show toast notification
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle add new product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  // Handle edit product
  const handleEditProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Handle product form submission
  const handleProductSubmit = async (data: ProductInput): Promise<boolean> => {
    setIsModalLoading(true);
    try {
      let success = false;

      if (selectedProduct) {
        // Update existing product
        success = await updateProduct(selectedProduct.id, data);
        if (success) {
          showNotification("Product updated successfully!");
        }
      } else {
        // Create new product
        success = await createProduct(data);
        if (success) {
          showNotification("Product created successfully!");
        }
      }

      if (success) {
        setShowProductModal(false);
        return true;
      } else {
        showNotification("Failed to save product. Please try again.", "error");
        return false;
      }
    } catch (error) {
      console.error("Product submit error:", error);
      showNotification("An error occurred. Please try again.", "error");
      return false;
    } finally {
      setIsModalLoading(false);
    }
  };

  // Handle product deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      const success = await deleteProduct(selectedProduct.id);
      if (success) {
        showNotification("Product deleted successfully!");
        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        showNotification("Failed to delete product. Please try again.", "error");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      showNotification("An error occurred while deleting. Please try again.", "error");
    }
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

  // Get stock status styling
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { text: "Out of Stock", className: "bg-red-100 text-red-800" };
    } else if (stock < 5) {
      return { text: "Low Stock", className: "bg-yellow-100 text-yellow-800" };
    } else {
      return { text: "In Stock", className: "bg-green-100 text-green-800" };
    }
  };

  if (error) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">Error Loading Products</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={refreshProducts}
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
              <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
              <p className="text-sm text-gray-600">
                Manage your shop items, add new products, and update inventory
              </p>
            </div>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <i className="fas fa-plus"></i>
              Add Product
            </button>
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowLowStock(!showLowStock);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  showLowStock
                    ? "border border-yellow-300 bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Low Stock
              </button>

              <button
                onClick={refreshProducts}
                className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                disabled={loading}
              >
                <i className={`fas fa-sync-alt mr-1 ${loading ? "animate-spin" : ""}`}></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" text="Loading products..." />
            </div>
          ) : !productsData?.products.length ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-400">
                <i className="fas fa-box-open text-4xl"></i>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No Products Found</h3>
              <p className="mb-4 text-gray-600">
                {searchTerm || showLowStock
                  ? "No products match your current filters."
                  : "Get started by adding your first product."}
              </p>
              {!searchTerm && !showLowStock && (
                <button
                  onClick={handleAddProduct}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <i className="fas fa-plus"></i>
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Product
                      <i
                        className={`fas fa-sort ${
                          sortBy === "name"
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
                      onClick={() => handleSort("price")}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Price
                      <i
                        className={`fas fa-sort ${
                          sortBy === "price"
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
                      onClick={() => handleSort("stock")}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Stock
                      <i
                        className={`fas fa-sort ${
                          sortBy === "stock"
                            ? sortOrder === "asc"
                              ? "fa-sort-up"
                              : "fa-sort-down"
                            : ""
                        }`}
                      ></i>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Variants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Created
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
                {productsData.products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <ProductImage
                              src={product.images[0] || ""}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="rounded-lg"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="line-clamp-1 text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="line-clamp-2 text-sm text-gray-500">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${stockStatus.className}`}
                          >
                            {stockStatus.text}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {product.variants?.length || 0} variants
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {product._count?.orderItems || 0} sold
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 transition-colors hover:text-blue-900"
                            title="Edit Product"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 transition-colors hover:text-red-900"
                            title="Delete Product"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {productsData && productsData.pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(productsData.pagination.page - 1) * productsData.pagination.limit + 1} to{" "}
                {Math.min(
                  productsData.pagination.page * productsData.pagination.limit,
                  productsData.pagination.total
                )}{" "}
                of {productsData.pagination.total} results
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
                  {Array.from(
                    { length: Math.min(5, productsData.pagination.totalPages) },
                    (_, i) => {
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
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === productsData.pagination.totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
        isLoading={isModalLoading}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        itemName={selectedProduct?.name}
        isLoading={loading}
      />
    </>
  );
}
