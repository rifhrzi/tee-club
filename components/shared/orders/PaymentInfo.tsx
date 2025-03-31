import { Payment, PaymentMethod, PaymentStatus } from "@/types/order";
import Image from "next/image";

interface PaymentInfoProps {
  payment: Payment;
}

export function PaymentInfo({ payment }: PaymentInfoProps) {
  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case "transfer":
        return "Transfer Bank";
      case "cod":
        return "COD";
      default:
        return method;
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return "Menunggu Pembayaran";
      case "paid":
        return "Sudah Dibayar";
      case "failed":
        return "Gagal";
      default:
        return status;
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Informasi Pembayaran</h2>
      <dl className="mt-4 space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Metode Pembayaran</dt>
          <dd className="mt-1 text-sm text-gray-900">{getPaymentMethodText(payment.method)}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Status Pembayaran</dt>
          <dd className="mt-1 text-sm text-gray-900">{getPaymentStatusText(payment.status)}</dd>
        </div>
        {payment.proof && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Bukti Pembayaran</dt>
            <dd className="mt-1">
              <div className="relative h-40 w-40 overflow-hidden rounded-lg">
                <Image src={payment.proof} alt="Bukti Pembayaran" fill className="object-cover" />
              </div>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
