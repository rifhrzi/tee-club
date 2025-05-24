"use client";

import React, { useEffect, useState } from 'react';

interface AuthLoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
  showBranding?: boolean;
  message?: string;
}

export default function AuthLoadingScreen({ 
  isLoading, 
  onComplete, 
  showBranding = true,
  message = "Initializing..."
}: AuthLoadingScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'loading' | 'fadeOut' | 'complete'>('intro');
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Start with intro animation
    const introTimer = setTimeout(() => {
      setAnimationPhase('loading');
    }, 800); // 800ms intro

    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!isLoading && animationPhase === 'loading') {
      // Start fade out when loading is complete
      setAnimationPhase('fadeOut');
      
      const fadeTimer = setTimeout(() => {
        setAnimationPhase('complete');
        setShowContent(false);
        onComplete?.();
      }, 600); // 600ms fade out

      return () => clearTimeout(fadeTimer);
    }
  }, [isLoading, animationPhase, onComplete]);

  if (!showContent) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-600 ${
        animationPhase === 'fadeOut' 
          ? 'opacity-0 scale-95' 
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-5 rounded-full animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white opacity-5 rounded-full animate-ping" 
             style={{ animationDuration: '8s' }} />
      </div>

      {/* Main Content */}
      <div className="relative text-center text-white">
        {/* Logo/Brand Section */}
        {showBranding && (
          <div className={`mb-8 transition-all duration-800 ${
            animationPhase === 'intro' 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}>
            <div className="mx-auto w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white border-opacity-30">
              <span className="text-3xl font-bold text-white">TC</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-wide">Tee Club</h1>
            <p className="mt-2 text-lg text-white text-opacity-90 font-light">Premium T-Shirt Collection</p>
          </div>
        )}

        {/* Loading Animation */}
        <div className={`mb-8 transition-all duration-800 delay-300 ${
          animationPhase === 'intro' 
            ? 'opacity-0 translate-y-8' 
            : 'opacity-100 translate-y-0'
        }`}>
          {/* Multi-layer Spinner */}
          <div className="relative mx-auto w-20 h-20">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-white border-opacity-20 rounded-full"></div>
            {/* Middle ring */}
            <div className="absolute inset-2 border-3 border-white border-opacity-40 rounded-full animate-spin" 
                 style={{ animationDuration: '2s' }}></div>
            {/* Inner ring */}
            <div className="absolute inset-4 border-2 border-white rounded-full animate-spin" 
                 style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>
            {/* Center dot */}
            <div className="absolute inset-8 bg-white rounded-full animate-pulse"></div>
          </div>
          
          {/* Loading Text */}
          <p className="mt-6 text-lg text-white text-opacity-90 animate-pulse">
            {animationPhase === 'loading' ? message : 'Welcome...'}
          </p>
        </div>

        {/* Progress Indicators */}
        <div className={`flex justify-center space-x-3 transition-all duration-800 delay-500 ${
          animationPhase === 'intro' 
            ? 'opacity-0 translate-y-8' 
            : 'opacity-100 translate-y-0'
        }`}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                animationPhase === 'loading' 
                  ? 'bg-white animate-bounce' 
                  : animationPhase === 'fadeOut'
                  ? 'bg-green-300'
                  : 'bg-white bg-opacity-50'
              }`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle Status Text */}
        <div className={`mt-8 transition-all duration-800 delay-700 ${
          animationPhase === 'intro' 
            ? 'opacity-0' 
            : 'opacity-100'
        }`}>
          <p className="text-sm text-white text-opacity-70">
            {animationPhase === 'loading' && 'Checking authentication...'}
            {animationPhase === 'fadeOut' && 'Ready!'}
          </p>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-white text-opacity-60">
          Powered by NextAuth & Midtrans
        </p>
      </div>
    </div>
  );
}
