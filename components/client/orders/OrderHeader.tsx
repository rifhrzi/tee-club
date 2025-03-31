import { Order } from "@/types/order";

interface OrderHeaderProps {
  order: Order;
  onBack: () => void;
}

export function OrderHeader({ order, onBack }: OrderHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Detail Pesanan #{order.id}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tanggal: {order.orderDate.toLocaleDateString("id-ID")}
            </p>
          </div>
          <button
            onClick={onBack}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
