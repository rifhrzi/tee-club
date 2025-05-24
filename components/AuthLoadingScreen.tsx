"use client";

import React, { useEffect, useState } from 'react';

interface AuthLoadingScreenProps {
  isLoading: boolean;
  onAnimationComplete?: () => void;
}

export default function AuthLoadingScreen({ isLoading, onAnimationComplete }: AuthLoadingScreenProps) {
  const [showContent, setShowContent] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'fadeOut' | 'complete'>('loading');

  useEffect(() => {
    if (!isLoading && animationPhase === 'loading') {
      // Start fade out animation
      setAnimationPhase('fadeOut');
      
      // Complete the animation after fade out
      const timer = setTimeout(() => {
        setAnimationPhase('complete');
        setShowContent(false);
        onAnimationComplete?.();
      }, 500); // 500ms fade out duration

      return () => clearTimeout(timer);
    }
  }, [isLoading, animationPhase, onAnimationComplete]);

  if (!showContent) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-500 ${
        animationPhase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main Content */}
      <div className="relative text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">TC</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-800">Tee Club</h1>
          <p className="mt-2 text-gray-600">Premium T-Shirt Collection</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          {/* Spinner */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Loading Text */}
          <p className="mt-4 text-gray-600 animate-pulse">
            {animationPhase === 'loading' ? 'Initializing...' : 'Almost ready...'}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                animationPhase === 'loading' 
                  ? 'bg-blue-400 animate-pulse' 
                  : 'bg-green-400'
              }`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle Animation Elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute -bottom-10 -right-10 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-gray-500">Powered by NextAuth & Midtrans</p>
      </div>
    </div>
  );
}
