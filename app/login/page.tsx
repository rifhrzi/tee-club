"use client";

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearStoredRedirectPath } from '@/utils/authRedirect';

function UserLogin() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const router = useRouter();

  // Check for redirect path on component mount
  useEffect(() => {
    const storedRedirect = localStorage.getItem('login_redirect');
    if (storedRedirect) {
      setRedirectPath(storedRedirect);
    }
  }, []);

  // Clear any previous errors when inputs change
  useEffect(() => {
    if (error) setError('');
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Login page: Attempting to log in with:', email);

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      await login(email, password);
      console.log('Login page: Login successful, redirecting...');

      // Show success message before redirecting
      setError('');

      // Clear any stored redirect paths
      const redirectTo = redirectPath || '/';
      localStorage.removeItem('login_redirect');
      clearStoredRedirectPath();

      // Redirect after a short delay
      setTimeout(() => {
        router.push(redirectTo);
      }, 500);

    } catch (error) {
      console.error('Login page: Login error:', error);

      if (error instanceof Error) {
        // Extract specific error message if available
        const errorMessage = error.message || 'Login failed. Please check your credentials.';

        if (errorMessage.includes('Invalid email or password')) {
          setError('The email or password you entered is incorrect. Please try again.');
        } else if (errorMessage.includes('Too many login attempts')) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Login page: User already authenticated, redirecting...');

      // Check if there's a redirect in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlRedirect = urlParams.get('redirect');
      const finalRedirect = urlRedirect || redirectPath || '/';

      // Redirect to the appropriate path
      router.push(finalRedirect);
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center">
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserLogin;