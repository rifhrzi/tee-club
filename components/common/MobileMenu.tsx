"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { NAVIGATION } from '../../constants';

interface MobileMenuProps {
    isOpen: boolean;
    user?: any; // Pass user from parent
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, user: propUser }) => {
    // Use NextAuth session
    const { data: session, status } = useSession();
    const user = propUser || session?.user;
    const isAuthenticated = status === 'authenticated' && !!session;
    const [isClient, setIsClient] = React.useState(false);

    // Set client-side rendering flag
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Debug: Log authentication state
    useEffect(() => {
        if (!isClient || !isOpen) return;

        console.log('MobileMenu - Auth State:', {
            status,
            isLoggedIn: isAuthenticated,
            user: user ? user.email : 'not logged in'
        });
    }, [isOpen, user, isAuthenticated, status, isClient]);

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
                {/* Only render auth UI on client side */}
                {isClient ? (
                    status === 'loading' ? (
                        // Show loading state
                        <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg w-full text-center">
                            Loading...
                        </div>
                    ) : !isAuthenticated ? (
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

                                    // Clear any checkout session data
                                    if (typeof window !== 'undefined') {
                                        localStorage.removeItem('nextauth_checkout_session');
                                        localStorage.removeItem('checkout_form_data');
                                    }

                                    // Call NextAuth signOut
                                    signOut({ callbackUrl: '/' });
                                }}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full"
                            >
                                Sign Out
                            </button>
                        </>
                    )
                ) : null}
            </div>
        </nav>
    );
};