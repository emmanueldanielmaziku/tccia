import { useEffect, useRef } from "react";
import useMenuState from "../app/client/services/MenuState";
import { useRightSidebar } from "../app/contexts/RightSidebarContext";

// Breakpoint for small screens (13-inch laptops and smaller)
const SMALL_SCREEN_BREAKPOINT = 1024; // Updated to 1024px for better 13-inch laptop support

export function useResponsiveSidebar() {
  const { isMenuOpen, setMenuOpen } = useMenuState();
  const { isRightSidebarOpen, setIsRightSidebarOpen } = useRightSidebar();
  const lastWindowWidth = useRef<number>(0);
  const userManuallyToggled = useRef<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const isSmallScreen = currentWidth < SMALL_SCREEN_BREAKPOINT;
      const wasSmallScreen = lastWindowWidth.current < SMALL_SCREEN_BREAKPOINT;
      
      // Only auto-adjust if the screen size category changed (small to large or vice versa)
      // and the user hasn't manually toggled recently
      if (isSmallScreen !== wasSmallScreen && !userManuallyToggled.current) {
        if (isSmallScreen) {
          // Auto-close both sidebars on small screens
          if (isMenuOpen) {
            setMenuOpen(false);
          }
          if (isRightSidebarOpen) {
            setIsRightSidebarOpen(false);
          }
        } else {
          // Auto-open sidebars on larger screens only if they were closed due to screen size
          if (!isMenuOpen) {
            setMenuOpen(true);
          }
          if (!isRightSidebarOpen) {
            setIsRightSidebarOpen(true);
          }
        }
      }
      
      lastWindowWidth.current = currentWidth;
      
      // Reset manual toggle flag after a delay
      if (userManuallyToggled.current) {
        setTimeout(() => {
          userManuallyToggled.current = false;
        }, 1000);
      }
    };

    // Set initial state
    lastWindowWidth.current = window.innerWidth;
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen, setMenuOpen, isRightSidebarOpen, setIsRightSidebarOpen]);

  // Function to mark that user manually toggled
  const markManualToggle = () => {
    userManuallyToggled.current = true;
  };

  return { 
    isMenuOpen, 
    setMenuOpen, 
    isRightSidebarOpen, 
    setIsRightSidebarOpen,
    markManualToggle
  };
}
