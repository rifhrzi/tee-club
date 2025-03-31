export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export type PaymentMethod = "transfer" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  proof: string;
}

export type ShippingMethod = "jne" | "jnt" | "sicepat" | "ninja" | "cod";

export interface Shipping {
  method: ShippingMethod;
  trackingNumber: string;
  estimatedDelivery: Date;
  cost: number;
}

export type OrderStatus = "pending" | "processing" | "dikirim" | "delivered" | "completed";

export interface Order {
  id: string;
  orderDate: Date;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  shipping: Shipping;
  payment: Payment;
  subtotal: number;
  discount: number;
  total: number;
}
