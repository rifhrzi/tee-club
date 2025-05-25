/**
 * Shopping Cart Store using Zustand
 *
 * This module provides a persistent shopping cart implementation with the following features:
 * - Client-side state management with Zustand
 * - Persistent storage using localStorage
 * - SSR-safe hydration handling
 * - Cart validation and cleanup utilities
 * - Authentication-aware cart operations
 *
 * @module CartStore
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem } from "./types";
import { redirectToSignup } from "../utils/authRedirect";
import {
  cleanCartItems,
  validateCartAgainstDatabase,
  debugCartStorage,
} from "../utils/cartCleanup";

/**
 * Browser environment detection
 * Used to prevent SSR issues and ensure client-side only operations
 */
const isBrowser = typeof window !== "undefined";

/**
 * Safely checks if localStorage is available and functional
 *
 * This function tests localStorage availability by attempting to write and read a test value.
 * It handles cases where localStorage might be disabled, unavailable, or throw exceptions.
 *
 * @returns {boolean} True if localStorage is available and functional
 */
function isLocalStorageAvailable(): boolean {
  if (!isBrowser) return false;

  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    // localStorage might be disabled in private browsing mode or due to storage quota
    return false;
  }
}

/**
 * Debug utility to inspect localStorage contents
 *
 * This function logs all localStorage keys and values for debugging purposes.
 * It's particularly useful for troubleshooting cart persistence issues.
 *
 * @returns {void}
 */
function debugLocalStorage(): void {
  if (!isBrowser) return;

  try {
    console.log("--- localStorage Debug ---");
    console.log("localStorage available:", isLocalStorageAvailable());

    if (isLocalStorageAvailable()) {
      console.log("localStorage keys:");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            console.log(`${key}:`, value);
          } catch (error) {
            console.error(`Error getting value for key ${key}:`, error);
          }
        }
      }
    }

    console.log("------------------------");
  } catch (error) {
    console.error("Error debugging localStorage:", error);
  }
}

/**
 * Cart Store State Interface
 *
 * Defines the structure and methods available in the cart store.
 * This interface ensures type safety for all cart operations.
 */
interface CartState {
  /** Array of items currently in the shopping cart */
  cart: CartItem[];

  /** Flag indicating whether the store has been initialized from localStorage */
  initialized: boolean;

  /**
   * Adds a product to the shopping cart
   *
   * @param product - The product to add to the cart
   * @param options - Optional configuration for the add operation
   * @param options.currentPath - Current page path for redirect after authentication
   * @param options.skipAuthCheck - Whether to skip authentication validation
   */
  addToCart: (
    product: Product,
    options?: { currentPath?: string; skipAuthCheck?: boolean }
  ) => void;

  /**
   * Removes a product from the shopping cart
   *
   * @param productId - The ID of the product to remove
   */
  removeFromCart: (productId: string | number) => void;

  /**
   * Updates the quantity of a specific product in the cart
   *
   * @param productId - The ID of the product to update
   * @param quantity - The new quantity (must be positive)
   */
  updateQuantity: (productId: string | number, quantity: number) => void;

  /**
   * Removes all items from the shopping cart
   */
  clearCart: () => void;

  /**
   * Initializes the store by loading data from localStorage
   * This method is called automatically on client-side hydration
   */
  initializeStore: () => void;

  /**
   * Debug utility to log current cart state and localStorage contents
   */
  debugCart: () => void;

  /**
   * Cleans up invalid cart items (malformed data, missing properties)
   *
   * @returns Promise that resolves when cleanup is complete
   */
  cleanupCart: () => Promise<void>;

  /**
   * Validates cart items against the database to ensure products still exist
   * and have sufficient stock
   *
   * @returns Promise that resolves when validation is complete
   */
  validateCart: () => Promise<void>;
}

/**
 * Create the cart store with Zustand and persistence middleware
 *
 * This store uses the persist middleware to automatically save cart state to localStorage.
 * It includes SSR-safe hydration and comprehensive error handling.
 */
const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: [],
      initialized: false,

      /**
       * Initialize the store from localStorage
       *
       * This method handles the complex process of safely loading cart data from localStorage
       * while dealing with SSR hydration, data validation, and error recovery.
       *
       * Key features:
       * - SSR-safe (only runs on client)
       * - Prevents double initialization
       * - Validates and cleans stored data
       * - Graceful error handling
       */
      initializeStore: () => {
        // Only run on client side to prevent SSR issues
        if (!isBrowser) return;

        // Prevent double initialization
        if (get().initialized) return;

        console.log("CartStore: Initializing store");

        // Check if localStorage is available (might be disabled in private browsing)
        if (!isLocalStorageAvailable()) {
          console.error("CartStore: localStorage is not available");
          set({ initialized: true });
          return;
        }

        // Attempt to load and parse stored cart data
        try {
          const storedData = localStorage.getItem("cart-storage");
          if (storedData) {
            const parsedData = JSON.parse(storedData);

            // Validate the structure of stored data
            if (parsedData.state && Array.isArray(parsedData.state.cart)) {
              console.log(
                "CartStore: Found stored cart data with",
                parsedData.state.cart.length,
                "items"
              );

              // Clean the cart data to remove any invalid items
              const cleanedCart = cleanCartItems(parsedData.state.cart);
              if (cleanedCart.length !== parsedData.state.cart.length) {
                console.log(
                  `CartStore: Cleaned cart from ${parsedData.state.cart.length} to ${cleanedCart.length} items`
                );
              }

              // Set the cleaned cart data and mark as initialized
              set({
                cart: cleanedCart,
                initialized: true,
              });
              return;
            }
          }
        } catch (error) {
          console.error("CartStore: Error reading from localStorage:", error);
          // Continue with empty cart if localStorage data is corrupted
        }

        // If we reach here, either there was no stored data or it was invalid
        // Initialize with empty cart
        set({ initialized: true });
      },

      /**
       * Debug utility method
       *
       * Logs comprehensive information about the current cart state and localStorage.
       * Useful for troubleshooting cart-related issues during development.
       */
      debugCart: () => {
        console.log("CartStore Debug:");
        console.log("- Cart items:", get().cart.length);
        console.log("- Initialized:", get().initialized);
        debugLocalStorage();
        debugCartStorage();
      },

      /**
       * Clean up invalid cart items
       *
       * Removes cart items that have malformed data or missing required properties.
       * This helps maintain data integrity and prevents errors in the UI.
       *
       * @returns Promise that resolves when cleanup is complete
       */
      cleanupCart: async () => {
        const currentCart = get().cart;
        const cleanedCart = cleanCartItems(currentCart);

        if (cleanedCart.length !== currentCart.length) {
          console.log(
            `Cleaned cart: removed ${currentCart.length - cleanedCart.length} invalid items`
          );
          set({ cart: cleanedCart });
        }
      },

      /**
       * Validate cart items against database
       *
       * Checks if products in the cart still exist in the database and have sufficient stock.
       * Removes items that are no longer available or out of stock.
       *
       * @returns Promise that resolves when validation is complete
       */
      validateCart: async () => {
        const currentCart = get().cart;
        const validatedCart = await validateCartAgainstDatabase(currentCart);

        if (validatedCart.length !== currentCart.length) {
          console.log(
            `Validated cart: removed ${
              currentCart.length - validatedCart.length
            } invalid/missing items`
          );
          set({ cart: validatedCart });
        }
      },

      /**
       * Add a product to the shopping cart
       *
       * This method handles adding products to the cart with the following logic:
       * - If the product already exists, increment its quantity
       * - If it's a new product, add it with quantity 1
       * - Authentication is handled by the calling components, not the store
       *
       * @param product - The product to add to the cart
       * @param options - Configuration options for the add operation
       */
      addToCart: (
        product: Product,
        options: { currentPath?: string; skipAuthCheck?: boolean } = {}
      ) => {
        console.log("CartStore: addToCart called with options:", options);

        // Note: Authentication validation is intentionally handled by the calling components
        // rather than in the store. This separation of concerns allows for more flexible
        // authentication handling and better testability.
        console.log("CartStore: Adding item to cart (authentication handled by pages)");

        // Update cart state using Zustand's set function
        set((state) => {
          // Check if the product already exists in the cart
          const existingItem = state.cart.find((item: CartItem) => item.product.id === product.id);

          if (existingItem) {
            // Product exists, increment quantity
            return {
              cart: state.cart.map((item: CartItem) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }

          // Product doesn't exist, add new item with quantity 1
          return { cart: [...state.cart, { product, quantity: 1 }] };
        });
      },

      /**
       * Remove a product from the cart
       *
       * Completely removes a product from the cart regardless of quantity.
       *
       * @param productId - The ID of the product to remove
       */
      removeFromCart: (productId: string | number) =>
        set((state) => ({
          cart: state.cart.filter((item: CartItem) => item.product.id !== productId),
        })),

      /**
       * Update the quantity of a product in the cart
       *
       * Sets the quantity of a specific product to the provided value.
       * If quantity is 0 or negative, the item should be removed using removeFromCart instead.
       *
       * @param productId - The ID of the product to update
       * @param quantity - The new quantity (should be positive)
       */
      updateQuantity: (productId: string | number, quantity: number) =>
        set((state) => ({
          cart: state.cart.map((item: CartItem) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })),

      /**
       * Clear all items from the cart
       *
       * Removes all products from the cart, resetting it to an empty state.
       * This is typically used after successful checkout or when user explicitly clears the cart.
       */
      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      // Configuration for Zustand persist middleware
      name: "cart-storage", // localStorage key name

      /**
       * Custom storage implementation with error handling
       *
       * This creates a storage adapter that safely handles localStorage operations
       * and provides fallbacks for SSR environments.
       */
      storage: createJSONStorage(() => {
        // Only use localStorage in browser environment
        return isBrowser
          ? {
              /**
               * Safely read from localStorage with error handling
               * @param name - The key to read from localStorage
               * @returns The stored value or null if error/not found
               */
              getItem: (name) => {
                try {
                  return localStorage.getItem(name);
                } catch (error) {
                  console.error(`Error reading from localStorage: ${name}`, error);
                  return null;
                }
              },

              /**
               * Safely write to localStorage with error handling
               * @param name - The key to write to localStorage
               * @param value - The value to store
               */
              setItem: (name, value) => {
                try {
                  localStorage.setItem(name, value);
                } catch (error) {
                  console.error(`Error writing to localStorage: ${name}`, error);
                }
              },

              /**
               * Safely remove from localStorage with error handling
               * @param name - The key to remove from localStorage
               */
              removeItem: (name) => {
                try {
                  localStorage.removeItem(name);
                } catch (error) {
                  console.error(`Error removing from localStorage: ${name}`, error);
                }
              },
            }
          : {
              // SSR-safe fallback storage (no-op operations)
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            };
      }),

      /**
       * Skip automatic hydration to prevent SSR mismatches
       *
       * We handle hydration manually in the initializeStore method
       * to have better control over the process and error handling.
       */
      skipHydration: true,

      /**
       * Specify which parts of the state to persist
       *
       * Only the cart array is persisted; other state like 'initialized'
       * is transient and should not be stored.
       */
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

/**
 * Initialize the store when this module is imported on the client side
 *
 * This ensures the cart is properly loaded from localStorage as soon as
 * the store is available. The setTimeout ensures this runs after React
 * hydration is complete to prevent hydration mismatches.
 */
if (isBrowser) {
  // Use setTimeout to ensure this runs after hydration
  setTimeout(() => {
    useCartStore.getState().initializeStore();
  }, 100);
}

/**
 * Export the cart store hook
 *
 * This hook can be used in React components to access and modify cart state.
 *
 * @example
 * ```typescript
 * const cart = useCartStore((state) => state.cart);
 * const addToCart = useCartStore((state) => state.addToCart);
 *
 * // Add a product to cart
 * addToCart(product, { skipAuthCheck: true });
 * ```
 */
export default useCartStore;
