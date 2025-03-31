import { Order, OrderStatus } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const orderService = {
  // Mengambil semua pesanan
  async getAllOrders(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data pesanan");
    }
    return response.json();
  },

  // Mengambil detail pesanan berdasarkan ID
  async getOrderById(id: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) {
      throw new Error("Gagal mengambil detail pesanan");
    }
    return response.json();
  },

  // Mengupdate status pesanan
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, trackingNumber }),
    });

    if (!response.ok) {
      throw new Error("Gagal mengupdate status pesanan");
    }
    return response.json();
  },

  // Mengupdate nomor resi
  async updateTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/tracking`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackingNumber }),
    });

    if (!response.ok) {
      throw new Error("Gagal mengupdate nomor resi");
    }
    return response.json();
  },
};
