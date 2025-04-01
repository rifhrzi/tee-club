import { Order } from "@/types/order";

interface OrderSummaryProps {
  order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Ringkasan Pesanan</h2>
      <div className="mt-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Subtotal</span>
          <span className="text-sm font-medium text-gray-900">
            Rp {new Intl.NumberFormat("id-ID").format(order.subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Ongkos Kirim</span>
          <span className="text-sm font-medium text-gray-900">
            Rp {new Intl.NumberFormat("id-ID").format(order.shipping.cost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Diskon</span>
          <span className="text-sm font-medium text-gray-900">
            - Rp {new Intl.NumberFormat("id-ID").format(order.discount)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-base font-medium text-gray-900">
              Rp {new Intl.NumberFormat("id-ID").format(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
