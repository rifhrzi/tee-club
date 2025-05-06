"use client";

import React, { useEffect, useState } from 'react';
import { Header, Footer } from './common';
import AuthStatus from './AuthStatus';
import dynamic from 'next/dynamic';

// Import PaymentAuthHandler with dynamic import to avoid hydration issues
const PaymentAuthHandler = dynamic(() => import('./payment/PaymentAuthHandler'), { ssr: false });

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isClient, setIsClient] = useState(false);

    // Set client-side flag once component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
            <Footer />
            <AuthStatus />
            <PaymentAuthHandler />
        </div>
    );
};

export default Layout;