// Admin Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
  productsSold: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsSoldChange: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    orders: number;
  };
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  variants: AdminVariant[];
  _count?: {
    orderItems: number;
  };
}

export interface AdminVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  paymentToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: AdminOrderItem[];
  shippingDetails: AdminShippingDetails | null;
  paymentDetails: AdminPaymentDetails | null;
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  variant: AdminVariant | null;
}

export interface AdminShippingDetails {
  id: string;
  orderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPaymentDetails {
  id: string;
  orderId: string;
  provider: string;
  transactionId: string;
  status: string;
  amount: number;
  rawResponse: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'bank_transfer' | 'ewallet' | 'cod';

// API Response Types
export interface AdminDashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    recentOrders: AdminOrder[];
    lowStockProducts: AdminProduct[];
    recentCustomers: AdminUser[];
  };
}

export interface AdminOrdersResponse {
  success: boolean;
  data: {
    orders: AdminOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminProductsResponse {
  success: boolean;
  data: {
    products: AdminProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Form Types
export interface CreateProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  variants?: {
    name: string;
    price: number;
    stock: number;
  }[];
}

export interface UpdateProductForm extends Partial<CreateProductForm> {
  id: string;
}

export interface UpdateOrderStatusForm {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}

// Real-time Event Types
export interface RealTimeEvent {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'PRODUCT_UPDATED' | 'STOCK_UPDATED';
  data: any;
  timestamp: Date;
}

export interface StockUpdateEvent {
  type: 'STOCK_UPDATED';
  data: {
    productId: string;
    variantId?: string;
    oldStock: number;
    newStock: number;
    reason: 'SALE' | 'RESTOCK' | 'ADJUSTMENT';
  };
  timestamp: Date;
}

export interface OrderEvent {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED';
  data: {
    orderId: string;
    userId: string;
    status: OrderStatus;
    totalAmount: number;
  };
  timestamp: Date;
}

// Filter and Search Types
export interface AdminFilters {
  status?: OrderStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  search?: string;
  lowStock?: boolean;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserFilters {
  role?: string[];
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
