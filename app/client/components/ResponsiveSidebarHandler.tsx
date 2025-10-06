"use client";

import { useEffect } from "react";
import { useResponsiveSidebar } from "../../../hooks/use-responsive-sidebar";

// This component handles the responsive sidebar behavior
export function ResponsiveSidebarHandler() {
  useResponsiveSidebar();
  return null; // This component doesn't render anything
}
