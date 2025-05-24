"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import { isStockError, formatStockErrorMessage } from '@/utils/stockValidation';

// Force this page to be client-side only
export const dynamic = "force-dynamic";

export default function Checkout() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const { data: session, status } = useSession();
  const auth = useUnifiedAuth();
  const requireAuth = useRequireAuth("/login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data state for restoration after login
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Set up form data restoration and handle authentication redirects
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear redirect tracking
      localStorage.removeItem("checkout_redirect_attempts");
      localStorage.removeItem("login_redirect");

      // Check for stored form data
      const storedFormData = localStorage.getItem("checkout_form_data");
      if (storedFormData) {
        try {
          const parsedData = JSON.parse(storedFormData);
          console.log("Found stored checkout form data, restoring fields");
          setFormData(parsedData);

          // Remove the stored data after restoring
          localStorage.removeItem("checkout_form_data");
        } catch (error) {
          console.error("Error parsing stored checkout form data:", error);
          localStorage.removeItem("checkout_form_data");
        }
      }
    }
  }, []);

  // Handle authentication redirects using unified auth
  useEffect(() => {
    if (!auth.isReady) return;

    console.log("Checkout page - Unified auth state:", {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      isReady: auth.isReady,
      userEmail: auth.userEmail || "not logged in",
    });

    if (requireAuth.shouldRedirect && requireAuth.redirectUrl) {
      console.log("Checkout requires authentication, redirecting to:", requireAuth.redirectUrl);
      router.push(requireAuth.redirectUrl);
    } else if (auth.isAuthenticated) {
      console.log("User is authenticated:", auth.userEmail);
    }
  }, [
    auth.isReady,
    auth.isAuthenticated,
    auth.isLoading,
    auth.userEmail,
    requireAuth.shouldRedirect,
    requireAuth.redirectUrl,
    router,
  ]);

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission which would cause a page refresh
    event.preventDefault();

    console.log("Checkout form submitted, preventing default page refresh");
    setLoading(true);
    setError("");

    try {
      if (cart.length === 0) {
        throw new Error("Your cart is empty. Please add items to your cart before checkout.");
      }

      // Check authentication status again before proceeding using unified auth
      if (auth.isLoading) {
        console.log("Authentication status is still loading, waiting...");
        setLoading(false);
        return;
      }

      if (!auth.isAuthenticated || !auth.user) {
        // Log detailed authentication state for debugging
        console.log("Checkout - Authentication check before proceeding:", {
          isAuthenticated: auth.isAuthenticated,
          isLoading: auth.isLoading,
          isReady: auth.isReady,
          user: !!auth.user,
        });

        console.log("Checkout requires authentication, redirecting to login");

        // Store checkout data in localStorage to restore after login
        if (typeof window !== "undefined") {
          const formElement = event.currentTarget as HTMLFormElement;
          const formData = new FormData(formElement);

          localStorage.setItem(
            "checkout_form_data",
            JSON.stringify({
              name: formData.get("name") || "",
              email: formData.get("email") || "",
              phone: formData.get("phone") || "",
              address: formData.get("address") || "",
              city: formData.get("city") || "",
              postalCode: formData.get("postalCode") || "",
              timestamp: new Date().toISOString(),
            })
          );
          console.log("Stored checkout form data for restoration after login");
        }

        router.push("/login?redirect=/checkout");
        return;
      }

      // Log authentication status
      console.log("Proceeding with authenticated checkout for:", auth.userEmail);

      const formData = new FormData(event.currentTarget);
      // Debug cart contents
      console.log('Checkout page - Cart contents:', JSON.stringify(cart, null, 2));

      const transformedItems = cart.map(item => {
        console.log('Checkout page - Processing cart item:', {
          productId: item.product.id,
          productName: item.product.name,
          hasVariant: !!item.product.variant,
          hasVariantId: !!item.product.variantId,
          variant: item.product.variant,
          variantId: item.product.variantId,
          quantity: item.quantity
        });

        const transformedItem: any = {
          productId: String(item.product.id),
          quantity: item.quantity,
        };

        // Check for variant in multiple ways
        if (item.product.variantId) {
          transformedItem.variantId = item.product.variantId;
          console.log('Checkout page - Added variantId from product.variantId:', item.product.variantId);
        } else if (item.product.variant?.id) {
          transformedItem.variantId = item.product.variant.id;
          console.log('Checkout page - Added variantId from product.variant.id:', item.product.variant.id);
        }

        console.log('Checkout page - Transformed item:', transformedItem);
        return transformedItem;
      });

      console.log('Checkout page - Final transformed items:', JSON.stringify(transformedItems, null, 2));

      const phoneInput = formData.get('phone') as string;
      const formattedPhone = phoneInput.startsWith('0')
        ? phoneInput
        : phoneInput.startsWith("+62")
          ? phoneInput.replace("+62", "0")
          : phoneInput.startsWith("62")
            ? phoneInput.replace("62", "0")
            : `0${phoneInput}`;

      // Prepare headers for the API request
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add user ID header for debugging
      // The API middleware will handle authentication via NextAuth session
      console.log("Using NextAuth session for authorization");

      // Store the user ID in a custom header for debugging
      if (auth.userId) {
        headers["x-nextauth-user-id-debug"] = auth.userId;
      }

      // Log all cookies for debugging
      console.log("Checkout page - Cookies before API request:");
      document.cookie.split(";").forEach((cookie) => {
        console.log("  ", cookie.trim());
      });

      // Log the session data
      console.log("Checkout page - Session data:", {
        id: session?.user?.id,
        email: session?.user?.email,
        name: session?.user?.name,
      });

      console.log("Sending checkout request with items:", transformedItems.length);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers,
        credentials: "include", // Important: Include cookies for authentication
        body: JSON.stringify({
          items: transformedItems,
          shippingDetails: {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formattedPhone,
            address: formData.get("address"),
            city: formData.get("city"),
            postalCode: formData.get("postalCode"),
          },
        }),
      });

      console.log("Checkout API response status:", response.status);
      const data = await response.json();
      console.log("Checkout API response data:", data);

      if (!response.ok) {
        console.log("Checkout API error response:", {
          status: response.status,
          data,
        });

        if (response.status === 401) {
          console.log("Authentication error during checkout, redirecting to login");

          // Store checkout data in localStorage to restore after login
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "checkout_form_data",
              JSON.stringify({
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                address: formData.get("address"),
                city: formData.get("city"),
                postalCode: formData.get("postalCode"),
                timestamp: new Date().toISOString(),
              })
            );
            console.log("Stored checkout form data for restoration after login");
          }

          // Redirect to login with checkout as the redirect destination
          router.push("/login?redirect=/checkout");
          return;
        }

        // Handle stock validation errors specifically
        if (response.status === 400 && isStockError(data)) {
          const stockErrorMessage = formatStockErrorMessage(data);
          throw new Error(stockErrorMessage);
        }

        if (response.status === 400 && data.details) {
          const validationErrors = data.details
            .map((error: any) => {
              const path = error.path.join(".");
              return `${path}: ${error.message}`;
            })
            .join("\n");
          throw new Error(`Validation errors:\n${validationErrors}`);
        }

        throw new Error(data.error || data.message || "Checkout failed");
      }

      if (typeof window !== "undefined") {
        // Store order information
        if (data.orderId) {
          localStorage.setItem("pending_order_id", data.orderId);
          console.log("Stored pending order ID:", data.orderId);
        }

        // Store NextAuth session information if available
        if (status === "authenticated" && session) {
          localStorage.setItem(
            "nextauth_checkout_session",
            JSON.stringify({
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
              },
              timestamp: new Date().toISOString(),
            })
          );
          console.log("Stored NextAuth session info for payment return");
        }

        // Store the return URL
        localStorage.setItem("checkout_return_url", window.location.href);
      }

      // Log the redirect
      console.log("Redirecting to payment gateway:", data.redirectUrl);

      // Use window.location for external redirects
      // This is necessary for Midtrans payment gateway
      // We've stored auth state above to handle return from payment
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        {/* ... (h1, error display, form inputs as before) ... */}
        <h1 className="mb-6 text-2xl font-bold text-gray-800 sm:mb-8 sm:text-3xl">
          Checkout Details
        </h1>

        {error && (
          <div
            className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 shadow-sm"
            role="alert"
          >
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Show loading state when authentication is being checked */}
        {auth.isLoading || !auth.isReady ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Verifying authentication...</p>
          </div>
        ) : !auth.isAuthenticated ? (
          <div className="mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
            <p>You need to be logged in to checkout.</p>
            <p className="mt-2">
              <Link href="/login?redirect=/checkout" className="text-blue-600 hover:underline">
                Click here to log in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-6 rounded-lg bg-white p-6 shadow-lg">
            {/* ... (all your form input divs: name, email, phone, address, city, postalCode) ... */}
            {/* For example: */}
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                defaultValue={formData.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
            {/* (Include all other input fields here as they were in the previous full code) */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                defaultValue={formData.email}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                defaultValue={formData.phone}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="08123456789"
                pattern="(\+62|62|0)8[1-9][0-9]{6,10}"
                title="Enter a valid Indonesian phone number (e.g., 08123456789, +628123456789)."
              />
              <p className="mt-1 text-xs text-gray-500">Format: 08xxxx, +628xxxx, or 628xxxx</p>
            </div>
            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
                Full Address
              </label>
              <textarea
                name="address"
                id="address"
                required
                rows={3}
                defaultValue={formData.address}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="123 Main St, Apartment 4B"
              />
            </div>
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                required
                defaultValue={formData.city}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Jakarta"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                required
                defaultValue={formData.postalCode}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="12345"
                pattern="\d{5}"
                title="Postal code must be 5 digits."
              />
              <p className="mt-1 text-xs text-gray-500">Enter a 5-digit postal code.</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {loading ? "Processing Order..." : "Place Order & Proceed to Payment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
