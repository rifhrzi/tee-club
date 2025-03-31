import { Order } from "@/types/order";

export const dummyOrders: Order[] = [
  {
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
      method: "jne",
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
  },
];
