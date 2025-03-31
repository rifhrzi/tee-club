"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";
import { orderService } from "@/services/orderServiceFactory";
import { OrderHeader } from "@/components/client/orders/OrderHeader";
import { CustomerInfo } from "@/components/shared/orders/CustomerInfo";
import { ShippingInfo } from "@/components/shared/orders/ShippingInfo";
import { OrderItems } from "@/components/shared/orders/OrderItems";
import { OrderSummary } from "@/components/shared/orders/OrderSummary";
import { PaymentInfo } from "@/components/shared/orders/PaymentInfo";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(params.id);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Memuat data pesanan...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-600">{error || "Pesanan tidak ditemukan"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderHeader order={order} onBack={() => router.push("/orders")} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Kolom Kiri - Informasi Utama */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CustomerInfo customer={order.customer} />
              <ShippingInfo shipping={order.shipping} />
            </div>
            <OrderItems items={order.items} />
            <PaymentInfo payment={order.payment} />
          </div>

          {/* Kolom Kanan - Ringkasan */}
          <div className="lg:col-span-1">
            <OrderSummary order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
