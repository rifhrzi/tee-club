// store/types.ts
export interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
  productId: string;
}

export interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  images?: string[];
  variant?: Variant; // Gunakan struktur Prisma
  variantId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
