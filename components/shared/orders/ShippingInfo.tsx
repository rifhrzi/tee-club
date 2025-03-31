import { Shipping } from "@/types/order";

interface ShippingInfoProps {
  shipping: Shipping;
}

export function ShippingInfo({ shipping }: ShippingInfoProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Informasi Pengiriman</h2>
      <dl className="mt-4 space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Metode Pengiriman</dt>
          <dd className="mt-1 text-sm text-gray-900">{shipping.method}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Nomor Resi</dt>
          <dd className="mt-1 text-sm text-gray-900">{shipping.trackingNumber || "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Estimasi Pengiriman</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {shipping.estimatedDelivery.toLocaleDateString("id-ID")}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Biaya Pengiriman</dt>
          <dd className="mt-1 text-sm text-gray-900">Rp {shipping.cost.toLocaleString("id-ID")}</dd>
        </div>
      </dl>
    </div>
  );
}
