"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  errors?: Record<string, string>;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false,
  errors = {},
}: ImageUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((fileObj) => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
    };
  }, [uploadedFiles]);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed";
    }

    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return;

    const newFiles: UploadedFile[] = [];
    const currentImageCount = images.length + uploadedFiles.length;

    for (let i = 0; i < files.length && currentImageCount + newFiles.length < maxImages; i++) {
      const file = files[i];
      const error = validateFile(file);

      if (!error) {
        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          uploading: false,
          uploaded: false,
        });
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      uploadFiles(newFiles);
    }
  };

  // Upload files to server
  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    for (const fileObj of filesToUpload) {
      try {
        // Update uploading state
        setUploadedFiles((prev) =>
          prev.map((f) => (f === fileObj ? { ...f, uploading: true } : f))
        );

        const formData = new FormData();
        formData.append("file", fileObj.file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();

        // Update uploaded state
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f === fileObj ? { ...f, uploading: false, uploaded: true, url: data.url } : f
          )
        );

        // Add to images array
        const currentImages = [...images];
        currentImages.push(data.url);
        onImagesChange(currentImages);
      } catch (error) {
        // Update error state
        setUploadedFiles((prev) =>
          prev.map((f) => (f === fileObj ? { ...f, uploading: false, error: "Upload failed" } : f))
        );
      }
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Handle URL input change
  const handleUrlChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    onImagesChange(newImages);
  };

  // Add URL field
  const addUrlField = () => {
    if (images.length < maxImages) {
      onImagesChange([...images, ""]);
    }
  };

  // Remove URL field
  const removeUrlField = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <label className="block text-sm font-medium text-gray-700">
          Product Images * ({uploadMethod === "url" ? "URLs" : "File Upload"})
        </label>
        <div className="flex rounded-lg border border-gray-300 p-1">
          <button
            type="button"
            onClick={() => setUploadMethod("file")}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              uploadMethod === "file"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            disabled={disabled}
          >
            <i className="fas fa-upload mr-1"></i>
            Upload Files
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod("url")}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              uploadMethod === "url"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            disabled={disabled}
          >
            <i className="fas fa-link mr-1"></i>
            Enter URLs
          </button>
        </div>
      </div>

      {uploadMethod === "file" ? (
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            } ${disabled ? "opacity-50" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={disabled}
            />
            <div className="space-y-2">
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
              <p className="text-gray-600">
                Drag and drop images here, or{" "}
                <span className="text-blue-600 underline">browse files</span>
              </p>
              <p className="text-sm text-gray-500">
                JPEG, PNG, WebP up to 5MB each (max {maxImages} images)
              </p>
            </div>
          </div>

          {/* Current Images (URLs) */}
          {images.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700">Current Images</h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {images.map((imageUrl, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative rounded-lg border border-gray-200 p-2"
                  >
                    <div className="aspect-square relative min-h-[120px] overflow-hidden rounded">
                      <Image
                        src={imageUrl || "/placeholder-image.svg"}
                        alt={`Current image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-image.svg";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index);
                        onImagesChange(newImages);
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      disabled={disabled}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploading Files Preview */}
          {uploadedFiles.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700">Uploading Files</h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {uploadedFiles.map((fileObj, index) => (
                  <div key={index} className="relative rounded-lg border border-gray-200 p-2">
                    <div className="aspect-square relative min-h-[120px] overflow-hidden rounded">
                      <Image
                        src={fileObj.preview}
                        alt={`Upload ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        unoptimized={true}
                      />
                      {fileObj.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          <LoadingSpinner size="small" />
                        </div>
                      )}
                      {fileObj.uploaded && (
                        <div className="absolute right-1 top-1 rounded-full bg-green-500 p-1">
                          <i className="fas fa-check text-xs text-white"></i>
                        </div>
                      )}
                      {fileObj.error && (
                        <div className="absolute right-1 top-1 rounded-full bg-red-500 p-1">
                          <i className="fas fa-times text-xs text-white"></i>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const fileToRemove = uploadedFiles[index];
                        if (fileToRemove.preview) {
                          URL.revokeObjectURL(fileToRemove.preview);
                        }

                        // If the file was successfully uploaded, remove it from the images array
                        if (fileToRemove.uploaded && fileToRemove.url) {
                          const updatedImages = images.filter((img) => img !== fileToRemove.url);
                          onImagesChange(updatedImages);
                        }

                        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      disabled={disabled || fileObj.uploading}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                    {fileObj.error && <p className="mt-1 text-xs text-red-600">{fileObj.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors[`images.${index}`] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://example.com/image.jpg"
                disabled={disabled}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlField(index)}
                  className="px-3 py-2 text-red-600 transition-colors hover:text-red-800"
                  disabled={disabled}
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={addUrlField}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 transition-colors hover:text-blue-800"
              disabled={disabled}
            >
              <i className="fas fa-plus"></i>
              Add Image URL
            </button>
          )}
        </div>
      )}

      {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
    </div>
  );
}
