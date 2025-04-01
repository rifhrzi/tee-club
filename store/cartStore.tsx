// store/CartStore.tsx
import { create } from "zustand";
import { Product, CartItem } from "./types";

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>((set) => ({
  cart: [],
  addToCart: (product: Product) =>
    set((state) => {
      const existingItem = state.cart.find(
        (item: CartItem) => item.product.id === product.id
      );
      if (existingItem) {
        return {
          cart: state.cart.map((item: CartItem) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    }),
  removeFromCart: (productId: string | number) =>
    set((state) => ({
      cart: state.cart.filter(
        (item: CartItem) => item.product.id !== productId
      ),
    })),
  updateQuantity: (productId: string | number, quantity: number) =>
    set((state) => ({
      cart: state.cart.map((item: CartItem) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ cart: [] }),
}));

export default useCartStore;
