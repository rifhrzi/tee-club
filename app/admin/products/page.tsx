'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import { formatPrice } from '@/constants';
import Link from 'next/link';

// Product interface
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

// Mock data for products
const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: `PROD-${(i + 1).toString().padStart(3, '0')}`,
  name: `Product ${i + 1}`,
  category: ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Accessories'][Math.floor(Math.random() * 4)],
  price: Math.floor(Math.random() * 50) + 20,
  stock: Math.floor(Math.random() * 100),
  status: Math.random() > 0.2 ? 'Active' : 'Inactive',
}));

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const itemsPerPage = 10;

  useEffect(() => {
    // In a real application, you would fetch the products data here
    const fetchProducts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(mockProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      // In a real application, you would call an API to delete the product
      setProducts(products.filter(p => p.id !== product.id));
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'name',
      label: 'Product Name',
    },
    {
      key: 'category',
      label: 'Category',
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => formatPrice(value),
    },
    {
      key: 'stock',
      label: 'Stock',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (product: Product) => {
        // In a real application, you would navigate to the edit page
        console.log('Edit product:', product);
      },
    },
    {
      label: 'Delete',
      icon: 'trash',
      onClick: handleDeleteProduct,
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Products"
        description="Manage your product inventory"
        actions={
          <Link href="/admin/products/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <i className="fas fa-plus mr-2"></i>
              Add Product
            </button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              id="search"
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
        <div>
          <label htmlFor="category" className="sr-only">Category</label>
          <select
            id="category"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1); // Reset to first page on category change
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={paginatedProducts}
        actions={actions}
        onRowClick={(product: Product) => {
          // In a real application, you would navigate to the product detail page
          console.log('View product:', product);
        }}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
    </AdminLayout>
  );
}
