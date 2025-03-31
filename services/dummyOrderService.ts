import { Order, OrderStatus } from "@/types/order";
import { dummyOrders } from "@/data/dummyOrders";

// Simulasi database dengan array
let orders = [...dummyOrders];

export const dummyOrderService = {
  // Mengambil semua pesanan
  async getAllOrders(): Promise<Order[]> {
    return orders;
  },

  // Mengambil detail pesanan berdasarkan ID
  async getOrderById(id: string): Promise<Order> {
    const order = orders.find((o) => o.id === id);
    if (!order) {
      throw new Error("Pesanan tidak ditemukan");
    }
    return order;
  },

  // Mengupdate status pesanan
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<Order> {
    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      throw new Error("Pesanan tidak ditemukan");
    }

    const updatedOrder = { ...orders[orderIndex] };
    updatedOrder.status = status;

    if (trackingNumber) {
      updatedOrder.shipping.trackingNumber = trackingNumber;
    }

    orders[orderIndex] = updatedOrder;
    return updatedOrder;
  },

  // Mengupdate nomor resi
  async updateTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      throw new Error("Pesanan tidak ditemukan");
    }

    const updatedOrder = { ...orders[orderIndex] };
    updatedOrder.shipping.trackingNumber = trackingNumber;

    orders[orderIndex] = updatedOrder;
    return updatedOrder;
  },
}; 