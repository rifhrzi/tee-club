import { useState } from "react";

interface OrderStatusFormProps {
  currentStatus: string;
  onStatusChange: (newStatus: string, trackingNumber?: string) => void;
}

export function OrderStatusForm({ currentStatus, onStatusChange }: OrderStatusFormProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === "dikirim") {
      setShowTrackingInput(true);
    } else {
      setShowTrackingInput(false);
      onStatusChange(newStatus);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showTrackingInput && trackingNumber.trim()) {
      onStatusChange("dikirim", trackingNumber.trim());
      setShowTrackingInput(false);
      setTrackingNumber("");
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status Pesanan
        </label>
        <select
          id="status"
          value={currentStatus}
          onChange={handleStatusChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="pending">Menunggu Pembayaran</option>
          <option value="processing">Diproses</option>
          <option value="dikirim">Dikirim</option>
          <option value="delivered">Diterima</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      {showTrackingInput && (
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Masukkan nomor resi"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Simpan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
