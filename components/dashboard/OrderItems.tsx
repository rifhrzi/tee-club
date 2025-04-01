import { OrderItem } from "@/types/order";

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
      <h2 className="text-lg font-medium text-gray-900">Daftar Produk</h2>
      <div className="mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Produk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ukuran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Harga Satuan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={item.image}
                        alt={item.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.size}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  Rp {new Intl.NumberFormat("id-ID").format(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
