"use client";
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useSessionTimeout } from "../../hooks/use-session-timeout";
import SessionTimeoutWarning from "./SessionTimeoutWarning";
import { useSessionExpired } from "../services/SessionExpiredService";

interface SessionTimeoutContextType {
  resetTimeout: () => void;
  pauseTimeout: () => void;
  resumeTimeout: () => void;
  timeRemaining: number;
  isWarningVisible: boolean;
  formatTimeRemaining: () => string;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

interface SessionTimeoutProviderProps {
  children: ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export function SessionTimeoutProvider({ 
  children, 
  timeoutMinutes = 30, 
  warningMinutes = 5 
}: SessionTimeoutProviderProps) {
  const { showSessionExpired } = useSessionExpired();
  
  const {
    isWarningVisible,
    timeRemaining,
    isActive,
    pauseTimeout,
    resumeTimeout,
    resetTimeout,
    formatTimeRemaining,
  } = useSessionTimeout({
    timeoutMinutes,
    warningMinutes,
  });

  // Reset timeout when component mounts (user is active)
  useEffect(() => {
    resetTimeout();
  }, [resetTimeout]);

  // Handle staying logged in
  const handleStayLoggedIn = () => {
    resetTimeout();
  };

  // Handle immediate logout
  const handleLogout = () => {
    showSessionExpired();
  };

  const contextValue: SessionTimeoutContextType = {
    resetTimeout,
    pauseTimeout,
    resumeTimeout,
    timeRemaining,
    isWarningVisible,
    formatTimeRemaining,
  };

  return (
    <SessionTimeoutContext.Provider value={contextValue}>
      {children}
      <SessionTimeoutWarning
        isOpen={isWarningVisible}
        timeRemaining={formatTimeRemaining()}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
    </SessionTimeoutContext.Provider>
  );
}

export function useSessionTimeoutContext() {
  const context = useContext(SessionTimeoutContext);
  if (context === undefined) {
    throw new Error("useSessionTimeoutContext must be used within a SessionTimeoutProvider");
  }
  return context;
}
