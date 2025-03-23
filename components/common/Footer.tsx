"use client";

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, NAVIGATION } from '../../constants';

export const Footer = () => {
    return (
        <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <i className="fas fa-tshirt text-blue-600 text-2xl"></i>
                            <h3 className="text-lg font-semibold text-gray-900">{SITE_CONFIG.name}</h3>
                        </div>
                        <p className="text-gray-600">{SITE_CONFIG.description}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {NAVIGATION.footer.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="hover:text-gray-900 transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            <a 
                                href={SITE_CONFIG.social.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-600 transition-colors" 
                                aria-label="Instagram"
                            >
                                <i className="fab fa-instagram text-xl"></i>
                            </a>
                            <a 
                                href={SITE_CONFIG.social.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-400 transition-colors" 
                                aria-label="Twitter"
                            >
                                <i className="fab fa-twitter text-xl"></i>
                            </a>
                            <a 
                                href={SITE_CONFIG.social.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-800 transition-colors" 
                                aria-label="Facebook"
                            >
                                <i className="fab fa-facebook text-xl"></i>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Newsletter</h4>
                        <form className="flex flex-col space-y-2" onSubmit={(e) => e.preventDefault()}>
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
                    <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
                    <div className="mt-2 flex justify-center space-x-4">
                        {NAVIGATION.legal.map((item) => (
                            <Link 
                                key={item.name}
                                href={item.href} 
                                className="hover:text-gray-900 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};