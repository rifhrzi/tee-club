"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import useCartStore from "@/store/cartStore";
import * as ls from "@/utils/localStorage";

// Import Layout with dynamic import to avoid hydration issues
const Layout = dynamic(() => import("@/components/Layout"), { ssr: false });

export default function TestStoragePage() {
  const [isClient, setIsClient] = useState(false);
  const [testKey, setTestKey] = useState("test-key");
  const [testValue, setTestValue] = useState("test-value");
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(false);
  
  // Get cart store functions
  const cart = useCartStore((state) => state.cart);
  const debugCart = useCartStore((state) => state.debugCart);
  const initializeStore = useCartStore((state) => state.initializeStore);
  
  // Initialize on mount
  useEffect(() => {
    setIsClient(true);
    setStorageAvailable(ls.isLocalStorageAvailable());
    
    // Try to get the test value
    if (ls.isBrowser) {
      try {
        const value = localStorage.getItem(testKey);
        setStoredValue(value);
      } catch (error) {
        console.error("Error getting test value:", error);
      }
    }
    
    // Initialize cart store
    initializeStore();
  }, [testKey, initializeStore]);
  
  // Handle setting a value
  const handleSetValue = () => {
    if (ls.isBrowser) {
      try {
        localStorage.setItem(testKey, testValue);
        setStoredValue(testValue);
        console.log(`Set ${testKey} to ${testValue}`);
      } catch (error) {
        console.error("Error setting value:", error);
      }
    }
  };
  
  // Handle getting a value
  const handleGetValue = () => {
    if (ls.isBrowser) {
      try {
        const value = localStorage.getItem(testKey);
        setStoredValue(value);
        console.log(`Got ${testKey}: ${value}`);
      } catch (error) {
        console.error("Error getting value:", error);
      }
    }
  };
  
  // Handle removing a value
  const handleRemoveValue = () => {
    if (ls.isBrowser) {
      try {
        localStorage.removeItem(testKey);
        setStoredValue(null);
        console.log(`Removed ${testKey}`);
      } catch (error) {
        console.error("Error removing value:", error);
      }
    }
  };
  
  // Handle debugging localStorage
  const handleDebugStorage = () => {
    ls.debugLocalStorage();
    debugCart();
  };
  
  if (!isClient) {
    return (
      <Layout>
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">Loading...</h1>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Test localStorage</h1>
        
        <div className="mb-6">
          <p className="mb-2">
            <span className="font-semibold">localStorage available:</span>{" "}
            {storageAvailable ? "Yes" : "No"}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Cart items:</span> {cart.length}
          </p>
        </div>
        
        <div className="mb-6 space-y-4">
          <div>
            <label className="block mb-2 font-medium">Key:</label>
            <input
              type="text"
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Value:</label>
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Stored Value:</label>
            <div className="px-3 py-2 border rounded-md bg-gray-50">
              {storedValue !== null ? storedValue : "(null)"}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSetValue}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Set Value
          </button>
          
          <button
            onClick={handleGetValue}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Get Value
          </button>
          
          <button
            onClick={handleRemoveValue}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Remove Value
          </button>
          
          <button
            onClick={handleDebugStorage}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Debug Storage
          </button>
        </div>
      </div>
    </Layout>
  );
}
