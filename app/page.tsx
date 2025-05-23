"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Hero, NewArrivals } from '../components/home';

const HomePage: React.FC = () => {
    return (
        <Layout>
            <Hero />
            <NewArrivals />
        </Layout>
    );
};

export default HomePage;
