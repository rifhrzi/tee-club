"use client";

import React, { useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">
                            <a href="/" className="flex items-center space-x-2">
                                <i className="fas fa-tshirt text-blue-600"></i>
                                <span>Tee Club</span>
                            </a>
                        </h1>

                        {/* Desktop Navigation */}
                        <div className="flex items-center">
                            <nav className="hidden lg:flex items-center space-x-8 mr-4">
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Home</a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Shop</a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
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
                    {isMobileMenuOpen && (
                        <nav className="lg:hidden py-4 border-t bg-white">
                            <div className="flex flex-col space-y-4">
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Home</a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Shop</a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                                    Sign In
                                </button>
                            </div>
                        </nav>
                    )}
                </div>
            </header>
            
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            <footer className="bg-white border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <i className="fas fa-tshirt text-blue-600 text-2xl"></i>
                                <h3 className="text-lg font-semibold text-gray-900">Tee Club</h3>
                            </div>
                            <p className="text-gray-600">Premium quality t-shirts designed for style and comfort.</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-gray-900 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">FAQs</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Size Guide</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Follow Us</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                                    <i className="fab fa-instagram text-xl"></i>
                                </a>
                                <a href="#" className="text-gray-600 hover:text-blue-400 transition-colors">
                                    <i className="fab fa-twitter text-xl"></i>
                                </a>
                                <a href="#" className="text-gray-600 hover:text-blue-800 transition-colors">
                                    <i className="fab fa-facebook text-xl"></i>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Newsletter</h4>
                            <form className="flex flex-col space-y-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
                        <p>&copy; {new Date().getFullYear()} Tee Club. All rights reserved.</p>
                        <div className="mt-2 flex justify-center space-x-4">
                            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;