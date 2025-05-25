"use client";

import React from "react";
import Layout from "../components/Layout";
import { Hero, NewArrivals } from "../components/home";
import { Header, Footer } from "../components/common";
import AuthStatus from "../components/AuthStatus";

const HomePage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <main className="flex-grow bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <NewArrivals />
        </div>
      </main>
      <Footer />
      <AuthStatus />
    </div>
  );
};

export default HomePage;
