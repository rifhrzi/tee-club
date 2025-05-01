'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardCard from '@/components/admin/DashboardCard';
import PageHeader from '@/components/admin/PageHeader';
import { formatPrice } from '@/constants';

// Mock data for the dashboard
const mockStats = {
  totalSales: 12580,
  totalOrders: 156,
  totalProducts: 48,
  totalUsers: 324,
  recentOrders: [
    { id: 'ORD-001', customer: 'John Doe', date: '2023-04-01', total: 125.99, status: 'Delivered' },
    { id: 'ORD-002', customer: 'Jane Smith', date: '2023-04-02', total: 89.50, status: 'Processing' },
    { id: 'ORD-003', customer: 'Bob Johnson', date: '2023-04-03', total: 210.75, status: 'Shipped' },
    { id: 'ORD-004', customer: 'Alice Brown', date: '2023-04-04', total: 45.25, status: 'Pending' },
    { id: 'ORD-005', customer: 'Charlie Wilson', date: '2023-04-05', total: 175.00, status: 'Delivered' },
  ],
  topProducts: [
    { name: 'Classic White Tee', sales: 42, revenue: 1260 },
    { name: 'Vintage Black Tee', sales: 38, revenue: 1140 },
    { name: 'Summer Collection Tee', sales: 35, revenue: 1050 },
    { name: 'Limited Edition Graphic Tee', sales: 28, revenue: 980 },
    { name: 'Eco-Friendly Cotton Tee', sales: 25, revenue: 875 },
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the dashboard data here
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        title="Dashboard" 
        description="Overview of your store's performance"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Sales"
          value={formatPrice(stats.totalSales)}
          icon="dollar-sign"
          color="blue"
          change={{ value: 12.5, isPositive: true }}
        />
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="shopping-cart"
          color="green"
          change={{ value: 8.2, isPositive: true }}
        />
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts}
          icon="tshirt"
          color="yellow"
          change={{ value: 3.1, isPositive: true }}
        />
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon="users"
          color="purple"
          change={{ value: 5.7, isPositive: true }}
        />
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Top Products</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sales} units</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(product.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/admin/products/${index + 1}`} className="text-blue-600 hover:text-blue-900">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
