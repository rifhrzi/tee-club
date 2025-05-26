"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingButton from "@/components/LoadingButton";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Delete confirmation error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={(e: React.MouseEvent) => e.target === e.currentTarget && !isLoading && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-lg bg-white shadow-xl"
        >
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <i className="fas fa-exclamation-triangle text-xl text-red-600"></i>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">{title}</h3>

            {/* Message */}
            <p className="mb-2 text-center text-gray-600">{message}</p>

            {/* Item Name */}
            {itemName && (
              <p className="mb-6 text-center">
                <span className="font-semibold text-gray-900">"{itemName}"</span>
              </p>
            )}

            {/* Warning */}
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start">
                <i className="fas fa-exclamation-circle mr-2 mt-0.5 text-sm text-red-500"></i>
                <p className="text-sm text-red-700">
                  This action cannot be undone. The item will be permanently deleted from the
                  system.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleConfirm}
                isLoading={isLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                loadingText="Deleting..."
              >
                Delete
              </LoadingButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
