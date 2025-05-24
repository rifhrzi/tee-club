// store/CartStore.tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem } from "./types";
import { redirectToSignup } from "../utils/authRedirect";

// Browser detection
const isBrowser = typeof window !== "undefined";

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  if (!isBrowser) return false;

  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Debug localStorage
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

interface CartState {
  cart: CartItem[];
  initialized: boolean;
  addToCart: (
    product: Product,
    options?: { currentPath?: string; skipAuthCheck?: boolean }
  ) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  initializeStore: () => void;
  debugCart: () => void;
}

// Create the store with persistence
const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      initialized: false,

      initializeStore: () => {
        // Only run on client side
        if (!isBrowser) return;

        // Check if we've already initialized
        if (get().initialized) return;

        console.log("CartStore: Initializing store");

        // Check if localStorage is available
        if (!isLocalStorageAvailable()) {
          console.error("CartStore: localStorage is not available");
          set({ initialized: true });
          return;
        }

        // Try to get cart data from localStorage directly
        try {
          const storedData = localStorage.getItem("cart-storage");
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.state && Array.isArray(parsedData.state.cart)) {
              console.log(
                "CartStore: Found stored cart data with",
                parsedData.state.cart.length,
                "items"
              );
              set({
                cart: parsedData.state.cart,
                initialized: true,
              });
              return;
            }
          }
        } catch (error) {
          console.error("CartStore: Error reading from localStorage:", error);
        }

        // If we get here, either there was no stored data or it was invalid
        set({ initialized: true });
      },

      debugCart: () => {
        console.log("CartStore Debug:");
        console.log("- Cart items:", get().cart.length);
        console.log("- Initialized:", get().initialized);
        debugLocalStorage();
      },

      addToCart: (
        product: Product,
        options: { currentPath?: string; skipAuthCheck?: boolean } = {}
      ) => {
        console.log("CartStore: addToCart called with options:", options);

        // Skip authentication check if explicitly requested (for authenticated users)
        // Skip authentication check in cart store - let pages handle authentication
        // The cart store should not be responsible for authentication validation
        // This will be handled by the pages that use the cart
        console.log("CartStore: Adding item to cart (authentication handled by pages)");

        // If authenticated, proceed with adding to cart
        set((state) => {
          const existingItem = state.cart.find((item: CartItem) => item.product.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item: CartItem) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { cart: [...state.cart, { product, quantity: 1 }] };
        });
      },

      removeFromCart: (productId: string | number) =>
        set((state) => ({
          cart: state.cart.filter((item: CartItem) => item.product.id !== productId),
        })),

      updateQuantity: (productId: string | number, quantity: number) =>
        set((state) => ({
          cart: state.cart.map((item: CartItem) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => {
        // Only use localStorage in browser environment
        return isBrowser
          ? {
              getItem: (name) => {
                try {
                  return localStorage.getItem(name);
                } catch (error) {
                  console.error(`Error reading from localStorage: ${name}`, error);
                  return null;
                }
              },
              setItem: (name, value) => {
                try {
                  localStorage.setItem(name, value);
                } catch (error) {
                  console.error(`Error writing to localStorage: ${name}`, error);
                }
              },
              removeItem: (name) => {
                try {
                  localStorage.removeItem(name);
                } catch (error) {
                  console.error(`Error removing from localStorage: ${name}`, error);
                }
              },
            }
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            };
      }),
      // Only rehydrate on client side
      skipHydration: true,
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

// Initialize the store when this module is imported on the client side
if (isBrowser) {
  // Use setTimeout to ensure this runs after hydration
  setTimeout(() => {
    useCartStore.getState().initializeStore();
  }, 100);
}

export default useCartStore;
