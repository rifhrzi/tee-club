import { Shipping } from "@/types/order";

interface ShippingInfoProps {
  shipping: Shipping;
}

export function ShippingInfo({ shipping }: ShippingInfoProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Informasi Pengiriman</h2>
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Metode Pengiriman</h3>
          <p className="mt-1 text-sm text-gray-900">{shipping.method}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Nomor Resi</h3>
          <p className="mt-1 text-sm text-gray-900">{shipping.trackingNumber}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Estimasi Pengiriman</h3>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(shipping.estimatedDelivery).toLocaleDateString("id-ID")}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Biaya Pengiriman</h3>
          <p className="mt-1 text-sm text-gray-900">
            Rp {new Intl.NumberFormat("id-ID").format(shipping.cost)}
          </p>
        </div>
      </div>
    </div>
  );
}
