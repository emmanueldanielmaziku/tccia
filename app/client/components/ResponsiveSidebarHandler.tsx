"use client";

import { useEffect } from "react";
import { useResponsiveSidebar } from "../../../hooks/use-responsive-sidebar";

// This component handles the responsive sidebar behavior
export function ResponsiveSidebarHandler() {
  const { markManualToggle } = useResponsiveSidebar();
  
  // Make markManualToggle available globally for the NavBar to use
  useEffect(() => {
    (window as any).markManualToggle = markManualToggle;
  }, [markManualToggle]);
  
  return null; // This component doesn't render anything
}
