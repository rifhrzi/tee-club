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

export interface Payment {
  method: string;
  status: string;
  proof: string;
}

export interface Shipping {
  method: string;
  trackingNumber: string;
  estimatedDelivery: Date;
  cost: number;
}

export interface Order {
  id: string;
  orderDate: Date;
  status: string;
  customer: Customer;
  items: OrderItem[];
  shipping: Shipping;
  payment: Payment;
  subtotal: number;
  discount: number;
  total: number;
}
