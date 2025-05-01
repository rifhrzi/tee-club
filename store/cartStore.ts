import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/constants";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>(
  persist(
    (set) => ({
  cart: [],
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find(
        (item) => String(item.product.id) === String(product.id)
      );
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            String(item.product.id) === String(product.id)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => String(item.product.id) !== String(productId)),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        String(item.product.id) === String(productId) ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ cart: [] }),
}),
{
  name: "cart-storage",
  // Only store the cart items
  partialize: (state) => ({ cart: state.cart }),
})
);

export default useCartStore;
