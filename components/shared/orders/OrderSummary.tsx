import { Order } from "@/types/order";

interface OrderSummaryProps {
  order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Ringkasan Pesanan</h2>
      <dl className="mt-4 space-y-4">
        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
          <dd className="text-sm text-gray-900">Rp {order.subtotal.toLocaleString("id-ID")}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Diskon</dt>
          <dd className="text-sm text-gray-900">Rp {order.discount.toLocaleString("id-ID")}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Biaya Pengiriman</dt>
          <dd className="text-sm text-gray-900">
            Rp {order.shipping.cost.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <dt className="text-base font-medium text-gray-900">Total</dt>
            <dd className="text-base font-medium text-gray-900">
              Rp {order.total.toLocaleString("id-ID")}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
