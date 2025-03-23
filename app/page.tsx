import React from 'react';
import Layout from '../components/Layout';

const HomePage: React.FC = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative mb-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Tee Club</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover our collection of premium quality t-shirts designed for style and comfort.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <img 
                        src="https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800" 
                        alt="Featured Collection" 
                        className="w-full h-[400px] object-cover rounded-lg shadow-lg" 
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <img src="https://images.pexels.com/photos/1484807/pexels-photo-1484807.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Style 2" className="w-full h-[190px] object-cover rounded-lg shadow-md" />
                        <img src="https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Style 3" className="w-full h-[190px] object-cover rounded-lg shadow-md" />
                        <img src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Style 4" className="w-full h-[190px] object-cover rounded-lg shadow-md" />
                        <div className="bg-gray-900 rounded-lg shadow-md flex items-center justify-center">
                            <span className="text-white text-lg font-semibold">View All</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="mb-16">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">New Arrivals</h3>
                    <a href="#" className="text-gray-600 hover:text-gray-900">View all →</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group">
                        <div className="relative overflow-hidden rounded-lg mb-4">
                            <img 
                                src="https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&w=800" 
                                alt="New Arrival 1" 
                                className="w-full h-[300px] object-cover transform transition-transform group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium">
                                    Quick View
                                </button>
                            </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Classic White Tee</h4>
                        <p className="text-gray-600">$29.99</p>
                    </div>
                    <div className="group">
                        <div className="relative overflow-hidden rounded-lg mb-4">
                            <img 
                                src="https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800" 
                                alt="New Arrival 2" 
                                className="w-full h-[300px] object-cover transform transition-transform group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium">
                                    Quick View
                                </button>
                            </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Urban Black Tee</h4>
                        <p className="text-gray-600">$34.99</p>
                    </div>
                    <div className="group">
                        <div className="relative overflow-hidden rounded-lg mb-4">
                            <img 
                                src="https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg?auto=compress&cs=tinysrgb&w=800" 
                                alt="New Arrival 3" 
                                className="w-full h-[300px] object-cover transform transition-transform group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium">
                                    Quick View
                                </button>
                            </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Vintage Print Tee</h4>
                        <p className="text-gray-600">$39.99</p>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default HomePage;
