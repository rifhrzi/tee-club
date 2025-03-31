import { Order, OrderStatus } from "@/types/order";
import { dummyOrderService } from "./dummyOrderService";

// Interface untuk service
interface IOrderService {
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<Order>;
  updateTrackingNumber(id: string, trackingNumber: string): Promise<Order>;
}

// Factory untuk memilih service yang akan digunakan
export const createOrderService = (): IOrderService => {
  // Gunakan environment variable untuk menentukan service yang digunakan
  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  if (useDummyData) {
    return dummyOrderService;
  }

  // Di sini Anda bisa menambahkan service API asli
  // return realOrderService;

  // Untuk sementara, gunakan dummy service
  return dummyOrderService;
};

// Export instance service yang sudah dibuat
export const orderService = createOrderService();
