import { Customer } from "@/types/order";

interface CustomerInfoProps {
  customer: Customer;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Informasi Pelanggan</h2>
      <dl className="mt-4 space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Nama</dt>
          <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email</dt>
          <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Telepon</dt>
          <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Alamat</dt>
          <dd className="mt-1 text-sm text-gray-900">{customer.address}</dd>
        </div>
      </dl>
    </div>
  );
}
