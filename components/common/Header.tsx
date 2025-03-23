"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
import { SITE_CONFIG, NAVIGATION } from '../../constants';

export const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-gray-900">
                        <Link href="/" className="flex items-center space-x-2">
                            <i className="fas fa-tshirt text-blue-600"></i>
                            <span>{SITE_CONFIG.name}</span>
                        </Link>
                    </h1>

                    {/* Desktop Navigation */}
                    <div className="flex items-center">
                        <nav className="hidden lg:flex items-center space-x-8 mr-4">
                            {NAVIGATION.main.map((item) => (
                                <Link 
                                    key={item.name}
                                    href={item.href} 
                                    className="text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Sign In
                            </button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button 
                            className="block lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <MobileMenu isOpen={isMobileMenuOpen} />
            </div>
        </header>
    );
};