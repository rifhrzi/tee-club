import { useState } from "react";
import { OrderStatus } from "@/types/order";

interface OrderStatusFormProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus, trackingNumber?: string) => void;
}

export function OrderStatusForm({ currentStatus, onStatusChange }: OrderStatusFormProps) {
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === "dikirim") {
      setShowTrackingInput(true);
    } else {
      setShowTrackingInput(false);
      onStatusChange(newStatus);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onStatusChange("dikirim", trackingNumber.trim());
      setShowTrackingInput(false);
      setTrackingNumber("");
    }
  };

  return (
    <div className="relative">
      {showTrackingInput ? (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Masukkan nomor resi"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kirim
          </button>
          <button
            type="button"
            onClick={() => setShowTrackingInput(false)}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Batal
          </button>
        </form>
      ) : (
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="pending">Menunggu Pembayaran</option>
          <option value="processing">Diproses</option>
          <option value="dikirim">Dikirim</option>
          <option value="delivered">Diterima</option>
          <option value="completed">Selesai</option>
        </select>
      )}
    </div>
  );
}
