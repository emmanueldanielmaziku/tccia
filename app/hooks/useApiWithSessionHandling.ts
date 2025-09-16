import { useSessionExpired } from "../services/SessionExpiredService";
import React, { useState, useRef, useEffect } from "react";

export function useApiWithSessionHandling() {
  const { showSessionExpired, resetSessionExpired } = useSessionExpired();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const hasShownPopup = useRef(false);

  // Reset session expired state when component mounts (user might have logged in again)
  useEffect(() => {
    resetSessionExpired();
    setIsSessionExpired(false);
    hasShownPopup.current = false;
  }, [resetSessionExpired]);

  const fetchWithSessionHandling = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    // Don't make API calls if session is already expired
    if (isSessionExpired || hasShownPopup.current) {
      throw new Error("SESSION_EXPIRED");
    }

    try {
      const response = await fetch(url, options);
      
      // Check for session expiration (403 Forbidden or 401 Unauthorized)
      if (response.status === 403 || response.status === 401) {
        if (!hasShownPopup.current) {
          hasShownPopup.current = true;
          setIsSessionExpired(true);
          showSessionExpired();
        }
        // Return a rejected promise instead of throwing to avoid console errors
        return Promise.reject(new Error("SESSION_EXPIRED"));
      }
      
      return response;
    } catch (error) {
      // Re-throw the error to be handled by the calling code
      throw error;
    }
  };

  return { fetchWithSessionHandling };
}
