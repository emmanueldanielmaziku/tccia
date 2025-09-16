"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import SessionExpiredPopup from "../client/components/SessionExpiredPopup";
import { setupFetchInterceptor, removeFetchInterceptor } from "../utils/fetchInterceptor";

interface SessionExpiredContextType {
  showSessionExpired: () => void;
  hideSessionExpired: () => void;
  isSessionExpiredVisible: boolean;
  resetSessionExpired: () => void;
}

const SessionExpiredContext = createContext<SessionExpiredContextType | undefined>(undefined);

export function SessionExpiredProvider({ children }: { children: ReactNode }) {
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [hasShownSessionExpired, setHasShownSessionExpired] = useState(false);

  const showSessionExpired = () => {
    // Prevent showing multiple times
    if (hasShownSessionExpired) {
      return;
    }
    
    setHasShownSessionExpired(true);
    setIsSessionExpiredVisible(true);
  };

  // Set up fetch interceptor when component mounts
  useEffect(() => {
    setupFetchInterceptor(showSessionExpired);
    
    // Cleanup on unmount
    return () => {
      removeFetchInterceptor();
    };
  }, []);

  const hideSessionExpired = () => {
    setIsSessionExpiredVisible(false);
    // Redirect to login page after closing
    window.location.href = "/auth";
  };

  const resetSessionExpired = () => {
    setHasShownSessionExpired(false);
    setIsSessionExpiredVisible(false);
  };

  return (
    <SessionExpiredContext.Provider
      value={{
        showSessionExpired,
        hideSessionExpired,
        isSessionExpiredVisible,
        resetSessionExpired,
      }}
    >
      {children}
      <SessionExpiredPopup
        isOpen={isSessionExpiredVisible}
        onClose={hideSessionExpired}
      />
    </SessionExpiredContext.Provider>
  );
}

export function useSessionExpired() {
  const context = useContext(SessionExpiredContext);
  if (context === undefined) {
    throw new Error("useSessionExpired must be used within a SessionExpiredProvider");
  }
  return context;
}

// Global error handler for API responses
export function handleApiError(response: Response, error?: any) {
  // Check for 403 Forbidden or 401 Unauthorized responses
  if (response.status === 403 || response.status === 401) {
    // Check if the response contains session expired indicators
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      // If it's JSON, we might want to check the response body
      // For now, we'll assume 403/401 means session expired
      return "SESSION_EXPIRED";
    }
    return "SESSION_EXPIRED";
  }
  
  return "UNKNOWN_ERROR";
}

// Enhanced fetch wrapper that handles session expiration
export async function fetchWithSessionHandling(
  url: string,
  options: RequestInit = {},
  onSessionExpired?: () => void
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Check for session expiration
    if (response.status === 403 || response.status === 401) {
      if (onSessionExpired) {
        onSessionExpired();
      }
      throw new Error("SESSION_EXPIRED");
    }
    
    return response;
  } catch (error) {
    // Re-throw the error to be handled by the calling code
    throw error;
  }
}
