'use client';

import React, { useState } from 'react';

interface ClickTestButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function ClickTestButton({ label, onClick, disabled = false }: ClickTestButtonProps) {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);

  const handleClick = () => {
    const now = Date.now();
    setClickCount(prev => prev + 1);
    setLastClickTime(now);
    
    console.log(`ClickTestButton: ${label} clicked (count: ${clickCount + 1})`);
    
    // Call the actual onClick handler
    onClick();
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`px-4 py-2 rounded font-medium transition-colors ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {label}
      </button>
      {clickCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {clickCount}
        </div>
      )}
    </div>
  );
}
