"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { useSessionExpired } from "../app/services/SessionExpiredService";

interface SessionTimeoutConfig {
  timeoutMinutes: number; // Total session timeout (e.g., 30 minutes)
  warningMinutes: number; // Warning before timeout (e.g., 5 minutes)
  checkInterval: number; // How often to check (in milliseconds)
}

interface SessionTimeoutState {
  isWarningVisible: boolean;
  timeRemaining: number;
  isActive: boolean;
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  timeoutMinutes: 30, // 30 minutes total session
  warningMinutes: 5,  // 5 minutes warning before logout
  checkInterval: 1000, // Check every second
};

export function useSessionTimeout(config: Partial<SessionTimeoutConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { showSessionExpired } = useSessionExpired();
  
  const [state, setState] = useState<SessionTimeoutState>({
    isWarningVisible: false,
    timeRemaining: mergedConfig.timeoutMinutes * 60,
    isActive: true,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isWarningShownRef = useRef<boolean>(false);

  // Calculate time remaining based on last activity
  const calculateTimeRemaining = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = Math.floor((now - lastActivityRef.current) / 1000);
    const totalTimeoutSeconds = mergedConfig.timeoutMinutes * 60;
    const remaining = Math.max(0, totalTimeoutSeconds - timeSinceLastActivity);
    
    return remaining;
  }, [mergedConfig.timeoutMinutes]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Reset warning state if user is active
    if (isWarningShownRef.current) {
      isWarningShownRef.current = false;
      setState(prev => ({
        ...prev,
        isWarningVisible: false,
        timeRemaining: mergedConfig.timeoutMinutes * 60,
      }));
    }
  }, [mergedConfig.timeoutMinutes]);

  // Show warning popup
  const showWarning = useCallback(() => {
    if (!isWarningShownRef.current) {
      isWarningShownRef.current = true;
      setState(prev => ({
        ...prev,
        isWarningVisible: true,
      }));
    }
  }, []);

  // Handle session timeout
  const handleTimeout = useCallback(() => {
    console.log("🕐 Session timeout reached - logging out user");
    showSessionExpired();
  }, [showSessionExpired]);

  // Main timeout checker
  const checkTimeout = useCallback(() => {
    const timeRemaining = calculateTimeRemaining();
    
    setState(prev => ({
      ...prev,
      timeRemaining,
    }));

    // Show warning if we're in the warning period
    const warningThreshold = mergedConfig.warningMinutes * 60;
    if (timeRemaining <= warningThreshold && timeRemaining > 0 && !isWarningShownRef.current) {
      showWarning();
    }

    // Handle timeout
    if (timeRemaining <= 0) {
      handleTimeout();
    }
  }, [calculateTimeRemaining, mergedConfig.warningMinutes, showWarning, handleTimeout]);

  // Set up activity listeners
  useEffect(() => {
    if (!state.isActive) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timeout checker
    timeoutRef.current = setInterval(checkTimeout, mergedConfig.checkInterval);

    return () => {
      // Cleanup event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      // Cleanup timeouts
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [state.isActive, handleActivity, checkTimeout, mergedConfig.checkInterval]);

  // Pause/resume functionality
  const pauseTimeout = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  const resumeTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    setState(prev => ({ ...prev, isActive: true }));
  }, []);

  // Reset timeout (useful after login)
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    isWarningShownRef.current = false;
    setState(prev => ({
      ...prev,
      isWarningVisible: false,
      timeRemaining: mergedConfig.timeoutMinutes * 60,
      isActive: true,
    }));
  }, [mergedConfig.timeoutMinutes]);

  // Format time remaining for display
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [state.timeRemaining]);

  return {
    ...state,
    pauseTimeout,
    resumeTimeout,
    resetTimeout,
    formatTimeRemaining,
    config: mergedConfig,
  };
}
