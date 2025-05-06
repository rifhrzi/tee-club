"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loginData, setLoginData] = useState({
    email: "admin@teelite.com",
    password: "admin123",
  });

  // Add log
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  // Login as admin
  const loginAsAdmin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    addLog("Starting admin login process...");

    try {
      // Step 1: Login
      addLog("Step 1: Logging in...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      addLog("Login successful!");
      addLog(`User data: ${JSON.stringify(data.user)}`);
      setSuccess("Login successful! Setting up localStorage...");

      // Step 2: Setup localStorage
      addLog("Step 2: Setting up localStorage...");
      
      const authData = {
        state: {
          isAuthenticated: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role || "ADMIN" // Ensure role exists
          },
          token: data.accessToken,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        },
        version: 1
      };
      
      localStorage.setItem("simple-auth-storage", JSON.stringify(authData));
      addLog("localStorage setup complete!");
      
      // Step 3: Redirect to admin page
      addLog("Step 3: Redirecting to admin page in 3 seconds...");
      setSuccess("Login successful! Redirecting to admin page...");
      
      setTimeout(() => {
        router.push("/admin");
      }, 3000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      addLog(`Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    localStorage.clear();
    addLog("localStorage cleared");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Login with your admin credentials
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={loginAsAdmin}
                disabled={loading}
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Processing..." : "Login as Admin"}
              </button>
              
              <button
                type="button"
                onClick={clearLocalStorage}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear localStorage
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-800 text-gray-200 p-4 rounded-lg shadow-md overflow-auto max-h-60">
          <h3 className="text-lg font-semibold mb-2">Logs</h3>
          <div className="font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet</p>
            ) : (
              logs.map((log, index) => <div key={index}>{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
