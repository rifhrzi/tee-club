'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import { formatPrice } from '@/constants';

// Order interface
interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: string;
  paymentStatus: string;
}

// Mock data for orders
const mockOrders = Array.from({ length: 30 }, (_, i) => ({
  id: `ORD-${(i + 1).toString().padStart(3, '0')}`,
  customer: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  total: Math.floor(Math.random() * 200) + 50,
  status: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'][Math.floor(Math.random() * 5)],
  paymentStatus: Math.random() > 0.2 ? 'Paid' : 'Unpaid',
}));

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const itemsPerPage = 10;

  useEffect(() => {
    // In a real application, you would fetch the orders data here
    const fetchOrders = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique statuses for filter
  const statuses = ['All', ...Array.from(new Set(orders.map(o => o.status)))];

  // This function can be used to update order status if needed
  // const handleUpdateOrderStatus = (order: Order, newStatus: string) => {
  //   // In a real application, you would call an API to update the order status
  //   const updatedOrders = orders.map(o =>
  //     o.id === order.id ? { ...o, status: newStatus } : o
  //   );
  //   setOrders(updatedOrders);
  // };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
    },
    {
      key: 'customer',
      label: 'Customer',
    },
    {
      key: 'date',
      label: 'Date',
    },
    {
      key: 'total',
      label: 'Total',
      render: (value: number) => formatPrice(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'Delivered' ? 'bg-green-100 text-green-800' :
          value === 'Shipped' ? 'bg-blue-100 text-blue-800' :
          value === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value: string) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'View',
      icon: 'eye',
      onClick: (order: Order) => {
        // In a real application, you would navigate to the order detail page
        console.log('View order:', order);
      },
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (order: Order) => {
        // In a real application, you would navigate to the edit page
        console.log('Edit order:', order);
      },
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
        title="Orders"
        description="Manage customer orders"
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
              placeholder="Search orders"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="sr-only">Status</label>
          <select
            id="status"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on status change
            }}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={paginatedOrders}
        actions={actions}
        onRowClick={(order: Order) => {
          // In a real application, you would navigate to the order detail page
          console.log('View order:', order);
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
