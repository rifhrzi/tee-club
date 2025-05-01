import React from 'react';
import { SITE_CONFIG, PRODUCTS } from '../../constants';
import Link from 'next/link';

export const Hero = () => {
    return (
        <section className="relative mb-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to {SITE_CONFIG.name}</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                    {SITE_CONFIG.description}
                </p>
                <div className="flex justify-center space-x-4">
                    <Link href="/shop" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Shop Now
                    </Link>
                    <Link href="/simple-login" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        Try Simple Login
                    </Link>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <img
                    src={PRODUCTS.featured.main}
                    alt="Featured Collection"
                    className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                    {PRODUCTS.featured.grid.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Style ${index + 2}`}
                            className="w-full h-[190px] object-cover rounded-lg shadow-md"
                        />
                    ))}
                    <div className="bg-gray-900 rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                        <span className="text-white text-lg font-semibold">View All</span>
                    </div>
                </div>
            </div>
        </section>
    );
};