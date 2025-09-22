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
      // But exclude authentication endpoints where 401 is expected for login failures
      if ((response.status === 403 || response.status === 401) && 
          !url.includes('/api/auth/user_token') &&
          !url.includes('/api/request-password-reset') &&
          !url.includes('/api/reset-password')) {
        
        // Enhanced authentication error detection
        try {
          const clonedResponse = response.clone();
          const responseData = await clonedResponse.json();
          
          // Check for various authentication error patterns
          const isAuthError = (
            // Standard jsonrpc error format
            (responseData.result?.error && responseData.result.error.toLowerCase().includes('token')) ||
            (responseData.result?.error && responseData.result.error.toLowerCase().includes('unauthorized')) ||
            (responseData.result?.error && responseData.result.error.toLowerCase().includes('authentication')) ||
            // Direct error format
            (responseData.error?.code === 'AUTHENTICATION_FAILED') ||
            (responseData.error?.message && responseData.error.message.toLowerCase().includes('token')) ||
            (responseData.error?.error_details && responseData.error.error_details.toLowerCase().includes('token')) ||
            // Simple status check for 401/403
            response.status === 401 || response.status === 403
          );
          
          if (isAuthError && !hasShownPopup.current) {
            console.log("🔴 useApiWithSessionHandling: Authentication error detected", {
              status: response.status,
              url: url,
              errorData: responseData
            });
            hasShownPopup.current = true;
            setIsSessionExpired(true);
            showSessionExpired();
            return Promise.reject(new Error("SESSION_EXPIRED"));
          }
        } catch (jsonError) {
          // If response is not JSON, fall back to status code check
          if (!hasShownPopup.current) {
            console.log("🔴 useApiWithSessionHandling: Session expired detected (status-based)", {
              status: response.status,
              url: url
            });
            hasShownPopup.current = true;
            setIsSessionExpired(true);
            showSessionExpired();
            return Promise.reject(new Error("SESSION_EXPIRED"));
          }
        }
      }
      
      return response;
    } catch (error) {
      // Re-throw the error to be handled by the calling code
      throw error;
    }
  };

  return { fetchWithSessionHandling };
}
