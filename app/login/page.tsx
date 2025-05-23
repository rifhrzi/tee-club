// app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clearStoredRedirectPath } from '@/utils/authRedirect';
// import { useLoading } from '@/contexts/LoadingContext'; // Keep if used for other global loading indicators
import LoadingButton from '@/components/LoadingButton';

function UserLogin() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed local loading state for clarity

  // const pageLoadingContext = useLoading(); // Only if you need its other functionalities

  const [determinedRedirectPath, setDeterminedRedirectPath] = useState<string>('/');
  const router = useRouter();
  const searchParams = useSearchParams();

  // ... (useEffect for determinedRedirectPath and authErrorParam remains the same) ...
  useEffect(() => {
    const urlRedirect = searchParams?.get('redirect');
    const storedRedirect = typeof window !== 'undefined' ? localStorage.getItem('auth_redirect') : null;
    const legacyRedirect = typeof window !== 'undefined' ? localStorage.getItem('login_redirect') : null;

    const finalRedirect = urlRedirect || storedRedirect || legacyRedirect || '/';
    setDeterminedRedirectPath(finalRedirect);

    console.log('Login page: Determined redirect path:', {
      urlRedirect,
      storedRedirect,
      legacyRedirect,
      finalRedirectCalculated: finalRedirect
    });

    const authErrorParam = searchParams?.get('error');
    if (authErrorParam) {
      switch (authErrorParam) {
        case 'CredentialsSignin':
          setError('Invalid email or password. Please try again.');
          break;
        default:
          setError('An error occurred during sign in. Please try again.');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) setError('');
  }, [email, password]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsSubmitting(true); // Use local state
    setError('');
    // pageLoadingContext.startLoading('Signing in...'); // Remove if using local state primarily

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
            setError('The email or password you entered is incorrect. Please try again.');
        } else if (result.error.includes('Too many login attempts')) {
            setError('Too many login attempts. Please try again later.');
        } else {
            setError(result.error || 'Login failed. Please check your credentials.');
        }
        // No return here, finally block will run
      } else if (result?.ok) { // Check for ok and no error explicitly
        console.log('Login page: Login successful. Determined redirect path for success:', determinedRedirectPath);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('login_redirect');
          localStorage.removeItem('auth_redirect');
          if (clearStoredRedirectPath) clearStoredRedirectPath();

          const pendingCartData = localStorage.getItem('pending_cart_data');
          if (pendingCartData) {
            localStorage.setItem('cart-storage', pendingCartData);
            localStorage.removeItem('pending_cart_data');
          }
        }
        router.push(determinedRedirectPath);
        // No setIsSubmitting(false) here if navigating away.
        return; // Successfully navigated, exit function.
      } else {
        // Handle cases where result is not ok but no specific error string from NextAuth perhaps
         setError(result?.error || 'An unknown issue occurred during login.');
      }
    } catch (error: any) {
      console.error('Login page: Login error (catch block):', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false); // Set to false in finally for all paths
      // pageLoadingContext.stopLoading(); // Remove if using local state primarily
    }
  };

  // ... (useEffect for status === 'authenticated' remains largely the same, using determinedRedirectPath) ...
  // Ensure it does not conflict with isSubmitting
  useEffect(() => {
    if (status === 'loading') {
      return; 
    }

    if (status === 'authenticated' && session) {
      console.log('Login page: User already authenticated. Determined redirect path:', determinedRedirectPath);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('login_redirect');
        localStorage.removeItem('auth_redirect');
        if (clearStoredRedirectPath) clearStoredRedirectPath();

        const pendingCartData = localStorage.getItem('pending_cart_data');
        if (pendingCartData) {
            localStorage.setItem('cart-storage', pendingCartData);
            localStorage.removeItem('pending_cart_data');
        }
      }
      router.push(determinedRedirectPath);
    }
  }, [status, session, router, determinedRedirectPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {/* ... form inputs ... */}
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
            <LoadingButton
              type="submit"
              isLoading={isSubmitting} // Use local isSubmitting state
              loadingText="Signing in..."
              className="w-full"
            >
              Sign in
            </LoadingButton>
          </div>
          <div className="text-sm text-center">
              <p>
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
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