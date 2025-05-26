"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const startLoading = (message?: string) => {
    setLoadingMessage(message);
    setIsLoading(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Add automatic cleanup after 30 seconds as a fallback for long operations
    timeoutRef.current = setTimeout(() => {
      console.warn(
        "LoadingContext: Auto-clearing loading state after 30s timeout. This may indicate a stuck operation."
      );
      setIsLoading(false);
      setLoadingMessage(undefined);
      timeoutRef.current = null;
    }, 30000); // 30 second timeout for better UX
  };

  const stopLoading = () => {
    // Clear the timeout when manually stopping
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsLoading(false);
    setLoadingMessage(undefined);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingOverlay isLoading={isLoading} text={loadingMessage} transparent={true} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
