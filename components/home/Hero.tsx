import React from "react";
import { SITE_CONFIG, FEATURED_IMAGES } from "../../constants";
import Link from "next/link";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
          alt="Premium T-Shirt Collection"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full px-4 text-center sm:px-6">
        <h1 className="mb-8 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {SITE_CONFIG.name}
          </span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-xl leading-8 text-gray-200 sm:text-2xl">
          {SITE_CONFIG.description}
        </p>
        <div className="flex justify-center">
          <Link
            href="/shop"
            className="btn btn-primary btn-lg px-8 py-4 text-lg shadow-lg transition-shadow duration-300 hover:shadow-xl"
          >
            <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};
