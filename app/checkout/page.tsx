"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import useCartStore from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useUnifiedAuth, useRequireAuth } from "@/hooks/useUnifiedAuth";
import Layout from "@/components/Layout";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckIcon,
  PencilIcon,
  ShoppingBagIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { formatPrice } from "@/constants";
import LoadingButton from "@/components/LoadingButton";

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

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

  // Fetch user profile when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      fetchUserProfile();
    }
  }, [auth.isAuthenticated, auth.user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);

        // Check if user has saved address
        const hasAddress =
          data.user.defaultAddressName &&
          data.user.defaultAddressAddress &&
          data.user.defaultAddressCity;

        if (hasAddress) {
          setUseSavedAddress(true);
          setFormData({
            name: data.user.defaultAddressName || data.user.name || "",
            email: data.user.email || "",
            phone: data.user.defaultAddressPhone || data.user.phone || "",
            address: data.user.defaultAddressAddress || "",
            city: data.user.defaultAddressCity || "",
            postalCode: data.user.defaultAddressPostalCode || "",
          });
        } else {
          // Pre-fill with basic user info
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleUseSavedAddress = (use: boolean) => {
    setUseSavedAddress(use);
    setIsEditingAddress(!use);

    if (use && userProfile) {
      // Use saved address
      setFormData({
        name: userProfile.defaultAddressName || userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.defaultAddressPhone || userProfile.phone || "",
        address: userProfile.defaultAddressAddress || "",
        city: userProfile.defaultAddressCity || "",
        postalCode: userProfile.defaultAddressPostalCode || "",
      });
    } else {
      // Clear address fields but keep basic info
      setFormData((prev) => ({
        ...prev,
        address: "",
        city: "",
        postalCode: "",
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
          localStorage.setItem(
            "checkout_form_data",
            JSON.stringify({
              ...formData,
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

      const transformedItems = cart.map((item) => {
        const transformedItem: any = {
          productId: String(item.product.id),
          quantity: item.quantity,
        };
        const product = item.product as any;
        if (product.variantId) {
          transformedItem.variantId = product.variantId;
        }
        return transformedItem;
      });

      const phoneInput = formData.phone;
      const formattedPhone = phoneInput.startsWith("0")
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
            name: formData.name,
            email: formData.email,
            phone: formattedPhone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
          saveAddress: saveAddress && !useSavedAddress, // Only save if checkbox is checked and not using saved address
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
                ...formData,
                timestamp: new Date().toISOString(),
              })
            );
            console.log("Stored checkout form data for restoration after login");
          }

          // Redirect to login with checkout as the redirect destination
          router.push("/login?redirect=/checkout");
          return;
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

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-2 text-gray-600">Complete your order details</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
            >
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {/* Show loading state when authentication is being checked */}
          {auth.isLoading || !auth.isReady ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
              <p className="mt-4 text-gray-600">Verifying authentication...</p>
            </div>
          ) : !auth.isAuthenticated ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Authentication Required</h3>
                  <p className="mt-1 text-yellow-700">You need to be logged in to checkout.</p>
                  <Link
                    href="/login?redirect=/checkout"
                    className="mt-3 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-primary-700"
                  >
                    Sign In to Continue
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                    <ShoppingBagIcon className="mr-2 h-5 w-5" />
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={`${item.product.id}-${(item.product as any).variantId || "default"}`}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={item.product.images?.[0] || "/placeholder-image.jpg"}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                          {(item.product as any).variantName && (
                            <p className="text-xs text-gray-600">
                              {(item.product as any).variantName}
                            </p>
                          )}
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Saved Address Section */}
                  {userProfile &&
                    userProfile.defaultAddressName &&
                    userProfile.defaultAddressAddress && (
                      <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                          Shipping Address
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                id="saved-address"
                                name="address-option"
                                checked={useSavedAddress}
                                onChange={() => handleUseSavedAddress(true)}
                                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div>
                                <label
                                  htmlFor="saved-address"
                                  className="text-sm font-medium text-gray-900"
                                >
                                  Use saved address
                                </label>
                                <div className="mt-1 text-sm text-gray-600">
                                  <p>{userProfile.defaultAddressName}</p>
                                  <p>{userProfile.defaultAddressAddress}</p>
                                  <p>
                                    {userProfile.defaultAddressCity},{" "}
                                    {userProfile.defaultAddressPostalCode}
                                  </p>
                                  <p>{userProfile.defaultAddressPhone}</p>
                                </div>
                              </div>
                            </div>
                            {useSavedAddress && (
                              <button
                                type="button"
                                onClick={() => setIsEditingAddress(true)}
                                className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                              >
                                <PencilIcon className="mr-1 h-4 w-4" />
                                Edit
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4">
                            <input
                              type="radio"
                              id="new-address"
                              name="address-option"
                              checked={!useSavedAddress}
                              onChange={() => handleUseSavedAddress(false)}
                              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                              htmlFor="new-address"
                              className="text-sm font-medium text-gray-900"
                            >
                              Use a different address
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Address Form */}
                  {(!useSavedAddress || isEditingAddress || !userProfile?.defaultAddressName) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-lg bg-white p-6 shadow"
                    >
                      <h3 className="mb-6 text-lg font-semibold text-gray-900">
                        {isEditingAddress ? "Edit Address" : "Shipping Details"}
                      </h3>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Full Name *
                          </label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email Address *
                          </label>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your email address"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                              placeholder="08123456789"
                              pattern="(\+62|62|0)8[1-9][0-9]{6,10}"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Format: 08xxxx, +628xxxx, or 628xxxx
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            City *
                          </label>
                          <div className="relative">
                            <MapPinIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your city"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Full Address *
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter your complete address"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                            placeholder="12345"
                            pattern="\d{5}"
                          />
                          <p className="mt-1 text-xs text-gray-500">Enter a 5-digit postal code</p>
                        </div>
                      </div>

                      {/* Save Address Option */}
                      {!useSavedAddress && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                              Save this address for future orders
                            </span>
                          </label>
                        </div>
                      )}

                      {isEditingAddress && (
                        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingAddress(false);
                              handleUseSavedAddress(true);
                            }}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(false)}
                            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Payment Section */}
                  <div className="rounded-lg bg-white p-6 shadow">
                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                      <CreditCardIcon className="mr-2 h-5 w-5" />
                      Payment Method
                    </h3>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-600">
                        You will be redirected to our secure payment gateway to complete your
                        payment. We accept various payment methods including bank transfer,
                        e-wallets, and more.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="rounded-lg bg-white p-6 shadow">
                    <LoadingButton
                      type="submit"
                      isLoading={loading}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-primary-700"
                    >
                      <span>
                        {loading ? "Processing Order..." : "Place Order & Proceed to Payment"}
                      </span>
                      <span className="text-xl">{formatPrice(cartTotal)}</span>
                    </LoadingButton>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
