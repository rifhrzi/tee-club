import { Payment } from "@/types/order";

interface PaymentInfoProps {
  payment: Payment;
}

export function PaymentInfo({ payment }: PaymentInfoProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Informasi Pembayaran</h2>
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Metode Pembayaran</h3>
          <p className="mt-1 text-sm text-gray-900">{payment.method}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status Pembayaran</h3>
          <p className="mt-1 text-sm text-gray-900">{payment.status}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Bukti Pembayaran</h3>
          <div className="mt-1">
            <img
              src={payment.proof}
              alt="Bukti Pembayaran"
              className="h-32 w-auto rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
