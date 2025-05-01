'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Teelite',
    storeEmail: 'info@teelite.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Main St, Anytown, USA',
    currency: 'USD',
    taxRate: 10,
  });

  const [shippingSettings, setShippingSettings] = useState({
    enableFreeShipping: true,
    freeShippingThreshold: 50,
    flatRateShipping: 5,
    internationalShipping: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableCreditCard: true,
    enablePayPal: true,
    enableBankTransfer: false,
    testMode: true,
  });

  const [isGeneralSaving, setIsGeneralSaving] = useState(false);
  const [isShippingSaving, setIsShippingSaving] = useState(false);
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState('');

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setShippingSettings({
      ...shippingSettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: checked,
    });
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneralSaving(true);
    
    try {
      // In a real application, you would call an API to save the settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('General settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving general settings:', error);
    } finally {
      setIsGeneralSaving(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsShippingSaving(true);
    
    try {
      // In a real application, you would call an API to save the settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Shipping settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving shipping settings:', error);
    } finally {
      setIsShippingSaving(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentSaving(true);
    
    try {
      // In a real application, you would call an API to save the settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Payment settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving payment settings:', error);
    } finally {
      setIsPaymentSaving(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="Settings" 
        description="Configure your store settings"
      />

      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-check-circle text-green-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">General Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Basic information about your store.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleGeneralSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                    Store Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="storeName"
                      id="storeName"
                      value={generalSettings.storeName}
                      onChange={handleGeneralChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700">
                    Store Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="storeEmail"
                      id="storeEmail"
                      value={generalSettings.storeEmail}
                      onChange={handleGeneralChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700">
                    Store Phone
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="storePhone"
                      id="storePhone"
                      value={generalSettings.storePhone}
                      onChange={handleGeneralChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <div className="mt-1">
                    <select
                      id="currency"
                      name="currency"
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700">
                    Store Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="storeAddress"
                      id="storeAddress"
                      value={generalSettings.storeAddress}
                      onChange={handleGeneralChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                    Tax Rate (%)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="taxRate"
                      id="taxRate"
                      min="0"
                      step="0.01"
                      value={generalSettings.taxRate}
                      onChange={handleGeneralChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isGeneralSaving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isGeneralSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGeneralSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Shipping Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Configure how shipping works in your store.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleShippingSubmit}>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableFreeShipping"
                      name="enableFreeShipping"
                      type="checkbox"
                      checked={shippingSettings.enableFreeShipping}
                      onChange={handleShippingChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableFreeShipping" className="font-medium text-gray-700">
                      Enable Free Shipping
                    </label>
                    <p className="text-gray-500">Offer free shipping on orders above a certain amount.</p>
                  </div>
                </div>

                {shippingSettings.enableFreeShipping && (
                  <div>
                    <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">
                      Free Shipping Threshold ({generalSettings.currency})
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="freeShippingThreshold"
                        id="freeShippingThreshold"
                        min="0"
                        step="0.01"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={handleShippingChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Orders above this amount will qualify for free shipping.
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="flatRateShipping" className="block text-sm font-medium text-gray-700">
                    Flat Rate Shipping ({generalSettings.currency})
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="flatRateShipping"
                      id="flatRateShipping"
                      min="0"
                      step="0.01"
                      value={shippingSettings.flatRateShipping}
                      onChange={handleShippingChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Standard shipping rate for all orders.
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="internationalShipping"
                      name="internationalShipping"
                      type="checkbox"
                      checked={shippingSettings.internationalShipping}
                      onChange={handleShippingChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="internationalShipping" className="font-medium text-gray-700">
                      Enable International Shipping
                    </label>
                    <p className="text-gray-500">Allow shipping to international addresses.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isShippingSaving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isShippingSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isShippingSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Configure payment methods for your store.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handlePaymentSubmit}>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableCreditCard"
                      name="enableCreditCard"
                      type="checkbox"
                      checked={paymentSettings.enableCreditCard}
                      onChange={handlePaymentChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableCreditCard" className="font-medium text-gray-700">
                      Enable Credit Card Payments
                    </label>
                    <p className="text-gray-500">Accept Visa, Mastercard, American Express, and Discover.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enablePayPal"
                      name="enablePayPal"
                      type="checkbox"
                      checked={paymentSettings.enablePayPal}
                      onChange={handlePaymentChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enablePayPal" className="font-medium text-gray-700">
                      Enable PayPal Payments
                    </label>
                    <p className="text-gray-500">Allow customers to pay with PayPal.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableBankTransfer"
                      name="enableBankTransfer"
                      type="checkbox"
                      checked={paymentSettings.enableBankTransfer}
                      onChange={handlePaymentChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableBankTransfer" className="font-medium text-gray-700">
                      Enable Bank Transfer
                    </label>
                    <p className="text-gray-500">Allow customers to pay via bank transfer.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="testMode"
                      name="testMode"
                      type="checkbox"
                      checked={paymentSettings.testMode}
                      onChange={handlePaymentChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="testMode" className="font-medium text-gray-700">
                      Test Mode
                    </label>
                    <p className="text-gray-500">Enable test mode for payments. No real charges will be made.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isPaymentSaving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isPaymentSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isPaymentSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
