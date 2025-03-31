"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";
import { OrderHeader } from "@/components/dashboard/OrderHeader";
import { CustomerInfo } from "@/components/dashboard/CustomerInfo";
import { ShippingInfo } from "@/components/dashboard/ShippingInfo";
import { OrderItems } from "@/components/dashboard/OrderItems";
import { OrderSummary } from "@/components/dashboard/OrderSummary";

// Data dummy untuk contoh
const dummyOrder: Order = {
  id: "ORD001",
  orderDate: new Date(),
  status: "pending",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "081234567890",
    address: "Jl. Contoh No. 123, Kota Contoh",
  },
  items: [
    {
      id: "ITEM001",
      name: "T-Shirt Basic",
      size: "L",
      quantity: 2,
      price: 150000,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: "ITEM002",
      name: "Hoodie Premium",
      size: "M",
      quantity: 1,
      price: 350000,
      image:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ],
  shipping: {
    method: "JNE",
    trackingNumber: "JNE123456789",
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    cost: 15000,
  },
  payment: {
    method: "transfer",
    status: "pending",
    proof: "https://example.com/payment-proof.jpg",
  },
  subtotal: 850000,
  discount: 50000,
  total: 815000,
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(dummyOrder.status);

  const handleStatusChange = (newStatus: string) => {
    setOrderStatus(newStatus);
    // Di sini Anda bisa menambahkan logika untuk menyimpan perubahan status ke backend
    console.log("Status pesanan diubah menjadi:", newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <OrderHeader
          order={dummyOrder}
          orderStatus={orderStatus}
          onStatusChange={handleStatusChange}
          onBack={() => router.push("/dashboard")}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <CustomerInfo customer={dummyOrder.customer} />
            <ShippingInfo shipping={dummyOrder.shipping} />
            <OrderItems items={dummyOrder.items} />
          </div>
          <div>
            <OrderSummary order={dummyOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}
