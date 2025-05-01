'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import Link from 'next/link';
import SocialLoginButton from '@/components/SocialLoginButton';

export default function SimpleLoginPage() {
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [redirectPath, setRedirectPath] = useState('/');
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already logged in and handle redirect
  useEffect(() => {
    // Get the redirect path from URL parameter
    const redirect = searchParams.get('redirect') || '/';
    setRedirectPath(redirect);
    console.log('SimpleLogin: Loaded with redirect path:', redirect);

    // If already logged in, redirect immediately
    if (isAuthenticated && user) {
      console.log('SimpleLogin: User already logged in, redirecting to:', redirect);
      window.location.href = redirect;
    } else {
      console.log('SimpleLogin: User not logged in, showing login form');
    }
  }, [isAuthenticated, user, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      console.log('SimpleLogin: Attempting login for:', email, 'Remember me:', rememberMe);
      await login(email, password, rememberMe);

      // At this point, login was successful
      console.log('SimpleLogin: Login successful, redirecting to:', redirectPath);

      // Redirect after successful login
      window.location.href = redirectPath;
    } catch (error) {
      console.error('SimpleLogin: Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      setError('');
      setSocialLoading(provider);

      console.log(`SimpleLogin: Attempting ${provider} login`);

      // In a real application, this would redirect to the OAuth provider
      // For now, we'll simulate a successful login after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate a successful login with mock user data
      const mockUserData = {
        id: '123456',
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
      };

      // Call the login function with the mock user data
      await login(mockUserData.email, 'social-auth-token', rememberMe);

      console.log(`SimpleLogin: ${provider} login successful, redirecting to:`, redirectPath);
      window.location.href = redirectPath;
    } catch (error) {
      console.error(`SimpleLogin: ${provider} login error:`, error);
      setError(`${provider} login failed. Please try again.`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Simple Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              go back to home
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <SocialLoginButton
              provider="google"
              onClick={() => handleSocialLogin('google')}
              disabled={!!socialLoading}
            />
            <SocialLoginButton
              provider="facebook"
              onClick={() => handleSocialLogin('facebook')}
              disabled={!!socialLoading}
            />
            <SocialLoginButton
              provider="github"
              onClick={() => handleSocialLogin('github')}
              disabled={!!socialLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
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
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!socialLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4 ${
                loading || socialLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : socialLoading ? `Signing in with ${socialLoading}...` : 'Sign in'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
