"use client";

import React from 'react';
import Link from 'next/link';
import { NAVIGATION } from '../../constants';

interface MobileMenuProps {
    isOpen: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <nav className="lg:hidden py-4 border-t bg-white">
            <div className="flex flex-col space-y-4">
                {NAVIGATION.main.map((item) => (
                    <Link 
                        key={item.name}
                        href={item.href} 
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        {item.name}
                    </Link>
                ))}
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                    Sign In
                </button>
            </div>
        </nav>
    );
};