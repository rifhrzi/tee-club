"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminInfoPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Admin Account Information
          </h1>

          {/* Admin Credentials Section */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              Available Admin Accounts
            </h2>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <p className="font-medium">Email: admin@example.com</p>
                <p className="text-sm text-gray-600">Password: securepassword</p>
                <p className="text-sm text-gray-600">Role: ADMIN</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Quick Actions
            </h2>
            <div className="space-x-4">
              <Link
                href="/login?redirect=/dashboard&message=admin-required"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Login as Admin
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Users List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              All Users in Database
            </h2>
            
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
                <p className="text-sm text-red-600 mt-1">
                  Note: This page requires authentication to view user data.
                </p>
              </div>
            )}

            {!loading && !error && users.length === 0 && (
              <p className="text-gray-600">No users found.</p>
            )}

            {!loading && !error && users.length > 0 && (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-md font-semibold text-gray-900 mb-2">
              How to Access Admin Dashboard
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click "Login as Admin" button above</li>
              <li>Use the pre-filled admin credentials (admin@example.com / securepassword)</li>
              <li>You will be redirected to the dashboard after successful login</li>
              <li>If you're already logged in as a regular user, log out first</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
