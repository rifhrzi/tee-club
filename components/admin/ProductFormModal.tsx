"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminProduct } from "@/types/admin";
import { ProductInput, ProductVariantInput, productSchema } from "@/lib/validation";
import LoadingButton from "@/components/LoadingButton";
import Toast from "@/components/Toast";
import ImageUpload from "./ImageUpload";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductInput) => Promise<boolean>;
  product?: AdminProduct | null;
  isLoading?: boolean;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    images: [""],
    variants: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Edit mode - populate form with existing product data
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          images: product.images.length > 0 ? product.images : [""],
          variants: product.variants || [],
        });
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          images: [""],
          variants: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const handleInputChange = (field: keyof ProductInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariantInput, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    const newVariant: ProductVariantInput = {
      name: "",
      price: formData.price,
      stock: 0,
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));
  };

  const removeVariant = (index: number) => {
    const newVariants = (formData.variants || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const validateForm = (): boolean => {
    try {
      // Filter out empty image URLs
      const validImages = formData.images.filter((img) => img.trim() !== "");
      const dataToValidate = { ...formData, images: validImages };

      productSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToastMessage("Please fix the form errors");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      // Filter out empty image URLs before submitting
      const validImages = formData.images.filter((img) => img.trim() !== "");
      const dataToSubmit = { ...formData, images: validImages };

      const success = await onSubmit(dataToSubmit);
      if (success) {
        setToastMessage(
          product ? "Product updated successfully!" : "Product created successfully!"
        );
        setToastType("success");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      setToastMessage("Failed to save product. Please try again.");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showToast && <Toast message={toastMessage} type={toastType} />}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={(e: React.MouseEvent) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
          >
            <div className="sticky top-0 rounded-t-lg border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {product ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                  disabled={isLoading}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter product name"
                    disabled={isLoading}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Price (IDR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0"
                      disabled={isLoading}
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Stock *</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock}
                      onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
                      className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        errors.stock ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0"
                      disabled={isLoading}
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`w-full resize-none rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter product description"
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Product Images */}
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => handleInputChange("images", images)}
                maxImages={10}
                disabled={isLoading}
                errors={errors}
              />

              {/* Product Variants */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Variants (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 transition-colors hover:text-blue-800"
                    disabled={isLoading}
                  >
                    <i className="fas fa-plus"></i>
                    Add Variant
                  </button>
                </div>

                {formData.variants && formData.variants.length > 0 && (
                  <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">Variant {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-red-600 transition-colors hover:text-red-800"
                            disabled={isLoading}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Variant Name
                            </label>
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Size M - Red"
                              disabled={isLoading}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Price (IDR)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={variant.price}
                              onChange={(e) =>
                                handleVariantChange(index, "price", parseFloat(e.target.value) || 0)
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                              disabled={isLoading}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Stock
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantChange(index, "stock", parseInt(e.target.value) || 0)
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <LoadingButton
                  type="submit"
                  isLoading={isLoading}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                  loadingText={product ? "Updating..." : "Creating..."}
                >
                  {product ? "Update Product" : "Create Product"}
                </LoadingButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
