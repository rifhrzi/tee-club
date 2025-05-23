"use client";

import React, { useEffect, useState } from 'react';
import { Header, Footer } from './common';
import AuthStatus from './AuthStatus';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side rendering
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
            {/* Only render AuthStatus on client side to prevent hydration mismatch */}
            {isClient && <AuthStatus />}
        </div>
    );
};

export default Layout;