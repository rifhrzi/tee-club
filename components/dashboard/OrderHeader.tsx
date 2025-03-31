import { Order } from "@/types/order";

interface OrderHeaderProps {
  order: Order;
  orderStatus: string;
  onStatusChange: (status: string) => void;
  onBack: () => void;
}

export function OrderHeader({ order, orderStatus, onStatusChange, onBack }: OrderHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan #{order.id}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tanggal Pesanan: {new Date(order.orderDate).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={orderStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pending">Menunggu Pembayaran</option>
              <option value="processing">Diproses</option>
              <option value="shipped">Dikirim</option>
              <option value="delivered">Diterima</option>
              <option value="selesai">Selesai</option>
            </select>
            <button
              onClick={onBack}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
