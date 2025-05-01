'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
    status: 'Active' | 'Inactive';
  };
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    category: initialData?.category || 'T-Shirts',
    images: initialData?.images || [],
    status: initialData?.status || 'Active',
  });

  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    });
  };

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updatedImages = [...imageUrls, newImageUrl];
      setImageUrls(updatedImages);
      setFormData({
        ...formData,
        images: updatedImages,
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedImages);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      router.push('/admin/products');
    } catch (err) {
      console.error('Error submitting product:', err);
      setError('Failed to save product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Write a detailed description of your product.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="stock"
              id="stock"
              min="0"
              required
              value={formData.stock}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <div className="mt-1">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="T-Shirts">T-Shirts</option>
              <option value="Hoodies">Hoodies</option>
              <option value="Sweatshirts">Sweatshirts</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Product Images
          </label>
          <div className="mt-1">
            <div className="flex">
              <input
                type="text"
                id="newImageUrl"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Add URLs for product images. The first image will be used as the main image.
            </p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                  <img src={url} alt={`Product image ${index + 1}`} className="object-center object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
