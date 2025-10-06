"use client";

import React, { createContext, useContext, useState } from "react";

interface RightSidebarContextType {
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined);

export function RightSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  return (
    <RightSidebarContext.Provider value={{ isRightSidebarOpen, setIsRightSidebarOpen }}>
      {children}
    </RightSidebarContext.Provider>
  );
}

export function useRightSidebar() {
  const context = useContext(RightSidebarContext);
  if (context === undefined) {
    throw new Error("useRightSidebar must be used within a RightSidebarProvider");
  }
  return context;
}
