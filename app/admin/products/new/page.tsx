'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const handleSubmit = async (data: any) => {
    // In a real application, you would call an API to create the product
    console.log('Creating product:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success
    return Promise.resolve();
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="Add New Product" 
        description="Create a new product in your inventory"
      />
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </AdminLayout>
  );
}
