"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import LoadingButton from "@/components/LoadingButton";
import { formatPrice } from "@/constants";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  orderTotal: number;
  orderId: string;
  isLoading?: boolean;
}

const refundReasons = [
  "Changed my mind",
  "Product not as described",
  "Received wrong item",
  "Product damaged/defective",
  "Delivery issues",
  "Other",
];

export default function RefundModal({
  isOpen,
  onClose,
  onConfirm,
  orderTotal,
  orderId,
  isLoading = false,
}: RefundModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      const reason = selectedReason === "Other" ? customReason : selectedReason;
      await onConfirm(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isLoading) return;
    setSelectedReason("");
    setCustomReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={(e: React.MouseEvent) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-xl bg-white shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Request Refund</h3>
                <p className="text-sm text-gray-600">Order #{orderId.substring(0, 8)}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="text-gray-400 transition-colors duration-200 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Refund Amount */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Refund Amount:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(orderTotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Full refund will be processed to your original payment method
              </p>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Reason for refund <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {refundReasons.map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="refundReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      disabled={isSubmitting || isLoading}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                    />
                    <span className="ml-3 text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            {selectedReason === "Other" && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Please specify <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  placeholder="Please provide details about your refund request..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:opacity-50"
                />
              </div>
            )}

            {/* Refund Policy */}
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-blue-900">Refund Policy</h4>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• Refunds are processed within 3-5 business days</li>
                <li>• Amount will be credited to your original payment method</li>
                <li>• Processing orders can be refunded immediately</li>
                <li>• Shipped orders may require return of items</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 rounded-b-xl border-t border-gray-200 bg-gray-50 p-6">
            <button
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleSubmit}
              isLoading={isSubmitting || isLoading}
              disabled={!selectedReason || (selectedReason === "Other" && !customReason.trim())}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              loadingText="Processing..."
            >
              Request Refund
            </LoadingButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
