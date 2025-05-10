"use client";

import React from 'react';
import { Header, Footer } from './common';
import AuthStatus from './AuthStatus';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        </div>
    );
};

export default Layout;