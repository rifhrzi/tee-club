"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Hero, NewArrivals } from '../components/home';
import { SessionProvider } from 'next-auth/react';

const HomePage: React.FC = () => {
    return (
        <SessionProvider>
            <Layout>
                <Hero />
                <NewArrivals />
            </Layout>
        </SessionProvider>
    );
};

export default HomePage;
