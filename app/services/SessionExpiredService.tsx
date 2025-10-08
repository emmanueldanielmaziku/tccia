"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import SessionExpiredPopup from "../client/components/SessionExpiredPopup";
import { setupFetchInterceptor, removeFetchInterceptor } from "../utils/fetchInterceptor";

interface SessionExpiredContextType {
  showSessionExpired: () => void;
  hideSessionExpired: () => void;
  isSessionExpiredVisible: boolean;
  resetSessionExpired: () => void;
}

const SessionExpiredContext = createContext<SessionExpiredContextType | undefined>(undefined);

// Global flag to prevent multiple redirects across all components
let isHandlingSessionExpiration = false;

export function SessionExpiredProvider({ children }: { children: ReactNode }) {
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [hasShownSessionExpired, setHasShownSessionExpired] = useState(false);
  const isCleaningUpRef = useRef(false);

  const showSessionExpired = () => {
    // Prevent showing multiple times across all instances
    if (hasShownSessionExpired || isHandlingSessionExpiration || isCleaningUpRef.current) {
      return;
    }
    
    console.log("🔴 Session expired - showing popup");
    isHandlingSessionExpiration = true;
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

  const clearAllSessionData = async () => {
    // Prevent multiple cleanup calls
    if (isCleaningUpRef.current) {
      return;
    }
    
    isCleaningUpRef.current = true;
    
    try {
      console.log("🔴 Clearing all session data...");
      
      // Clear all localStorage data
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Call logout API to clear server-side cookies
      try {
        await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error calling logout API:", error);
        // Continue with redirect even if logout API fails
      }
      
      console.log("🔴 Session data cleared, redirecting to /auth");
    } catch (error) {
      console.error("Error clearing session data:", error);
    }
  };

  const hideSessionExpired = async () => {
    setIsSessionExpiredVisible(false);
    
    // Clear all session data
    await clearAllSessionData();
    
    // Force a hard redirect to clear all state
    window.location.replace("/auth");
  };

  const resetSessionExpired = () => {
    // Only reset if we're on the auth page
    if (typeof window !== "undefined" && window.location.pathname === "/auth") {
      setHasShownSessionExpired(false);
      setIsSessionExpiredVisible(false);
      isHandlingSessionExpiration = false;
      isCleaningUpRef.current = false;
    }
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
