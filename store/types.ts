// store/types.ts
export interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  images?: string[];
  variant?: string;
  variantId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
