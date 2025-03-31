import { OrderItem } from "@/types/order";
import Image from "next/image";

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Item Pesanan</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 border-b border-gray-200 pb-4 last:border-0"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                Ukuran: {item.size} | Jumlah: {item.quantity}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                Rp {item.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
