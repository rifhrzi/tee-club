import { Order } from "@/types/order";
import { OrderStatusForm } from "./OrderStatusForm";

interface OrderHeaderProps {
  order: Order;
  orderStatus: string;
  onStatusChange: (newStatus: string, trackingNumber?: string) => void;
  onBack: () => void;
}

export function OrderHeader({ order, orderStatus, onStatusChange, onBack }: OrderHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Kembali
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pesanan #{order.id}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Tanggal: {new Date(order.orderDate).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-80">
            <OrderStatusForm currentStatus={orderStatus} onStatusChange={onStatusChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
