"use client";

import React from "react";

interface SocialLoginButtonProps {
  provider: "google" | "facebook" | "github";
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

export default function SocialLoginButton({
  provider,
  onClick,
  disabled = false,
}: SocialLoginButtonProps) {
  const getProviderDetails = () => {
    switch (provider) {
      case "google":
        return {
          name: "Google",
          bgColor: "bg-white",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          hoverBg: "hover:bg-gray-50",
          icon: (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
          ),
        };
      case "facebook":
        return {
          name: "Facebook",
          bgColor: "bg-blue-600",
          textColor: "text-white",
          borderColor: "border-blue-700",
          hoverBg: "hover:bg-blue-700",
          icon: (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
              />
            </svg>
          ),
        };
      case "github":
        return {
          name: "GitHub",
          bgColor: "bg-gray-800",
          textColor: "text-white",
          borderColor: "border-gray-900",
          hoverBg: "hover:bg-gray-900",
          icon: (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
          ),
        };
      default:
        return {
          name: provider,
          bgColor: "bg-gray-200",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          hoverBg: "hover:bg-gray-300",
          icon: null,
        };
    }
  };

  const { name, bgColor, textColor, borderColor, hoverBg, icon } = getProviderDetails();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center border px-4 py-2 ${borderColor} rounded-md shadow-sm ${bgColor} ${textColor} ${hoverBg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {icon}
      <span>Continue with {name}</span>
    </button>
  );
}
