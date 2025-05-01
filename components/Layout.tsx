"use client";

import React from 'react';
import { Header, Footer } from './common';
import SimpleAuthStatus from './SimpleAuthStatus';
import SimpleAuthProvider from './SimpleAuthProvider';
import dynamic from 'next/dynamic';

// Import PaymentAuthHandler with dynamic import to avoid hydration issues
const PaymentAuthHandler = dynamic(() => import('./payment/PaymentAuthHandler'), { ssr: false });

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SimpleAuthProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
                <Footer />
                <PaymentAuthHandler />
            </div>
        </SimpleAuthProvider>
    );
};

export default Layout;