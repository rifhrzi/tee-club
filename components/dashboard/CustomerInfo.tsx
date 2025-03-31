import { Customer } from "@/types/order";

interface CustomerInfoProps {
  customer: Customer;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Informasi Pelanggan</h2>
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Nama</h3>
          <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Telepon</h3>
          <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Alamat Pengiriman</h3>
          <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
        </div>
      </div>
    </div>
  );
}
