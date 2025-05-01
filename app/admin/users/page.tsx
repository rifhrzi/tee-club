'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string | null;
}

// Mock data for users
const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: `USER-${(i + 1).toString().padStart(3, '0')}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: Math.random() > 0.8 ? 'ADMIN' : 'USER',
  status: Math.random() > 0.1 ? 'Active' : 'Inactive',
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  lastLogin: Math.random() > 0.2
    ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null,
}));

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const itemsPerPage = 10;

  useEffect(() => {
    // In a real application, you would fetch the users data here
    const fetchUsers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique roles for filter
  const roles = ['All', ...Array.from(new Set(users.map(u => u.role)))];

  const handleToggleUserStatus = (user: User) => {
    // In a real application, you would call an API to update the user status
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const updatedUsers = users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      ),
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
    {
      key: 'createdAt',
      label: 'Created At',
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value: string | null) => value || 'Never',
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (user: User) => {
        // In a real application, you would navigate to the edit page
        console.log('Edit user:', user);
      },
    },
    {
      label: 'Toggle Status',
      icon: (user: User) => user.status === 'Active' ? 'user-slash' : 'user-check',
      onClick: handleToggleUserStatus,
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
        title="Users"
        description="Manage user accounts"
        actions={
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <i className="fas fa-user-plus mr-2"></i>
            Add User
          </button>
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
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
        <div>
          <label htmlFor="role" className="sr-only">Role</label>
          <select
            id="role"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on role change
            }}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={paginatedUsers}
        actions={actions}
        onRowClick={(user: User) => {
          // In a real application, you would navigate to the user detail page
          console.log('View user:', user);
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
