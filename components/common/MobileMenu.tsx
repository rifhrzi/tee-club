"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { NAVIGATION } from '../../constants';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
    isOpen: boolean;
    user?: any; // Pass user from parent
    logout?: () => void; // Pass logout function from parent
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, user: propUser, logout: propLogout }) => {
    // Use props if provided, otherwise use the hook
    const authHook = useAuth();
    const user = propUser || authHook.user;
    const logout = propLogout || authHook.logout;
    const isAuthenticated = authHook.isAuthenticated;

    // Debug: Log authentication state
    useEffect(() => {
        if (isOpen) {
            console.log('MobileMenu - Auth State:', {
                isLoggedIn: isAuthenticated,
                user: user ? user.email : 'not logged in'
            });
        }
    }, [isOpen, user, isAuthenticated]);

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
                {!isAuthenticated ? (
                    <Link
                        href="/login"
                        className="block w-full"
                        onClick={() => {
                            console.log('MobileMenu: Login button clicked');
                            // Force navigation to login page
                            window.location.href = '/login';
                        }}
                    >
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                            Sign In
                        </button>
                    </Link>
                ) : (
                    <>
                        <Link href="/orders" className="text-gray-700 hover:text-gray-900 transition-colors">
                            My Orders
                        </Link>
                        <button
                            onClick={() => {
                                console.log('MobileMenu: Sign Out button clicked');

                                // Clear cookies manually before calling logout
                                document.cookie = "auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                                document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";

                                // Also clear localStorage
                                localStorage.removeItem('auth-storage');

                                // For backward compatibility, also clear the old cookie and localStorage
                                document.cookie = "simple-auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                                document.cookie = "simple-auth-storage=; path=/; max-age=0; SameSite=Lax";
                                localStorage.removeItem('simple-auth-storage');

                                // Call the logout function
                                logout();

                                // Force reload after a short delay
                                setTimeout(() => {
                                    window.location.href = '/';
                                }, 100);
                            }}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full"
                        >
                            Sign Out
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};