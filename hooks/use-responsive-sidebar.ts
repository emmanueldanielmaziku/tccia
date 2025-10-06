import { useEffect } from "react";
import useMenuState from "../app/client/services/MenuState";
import { useRightSidebar } from "../app/contexts/RightSidebarContext";

// Breakpoint for small screens (13-inch laptops and smaller)
const SMALL_SCREEN_BREAKPOINT = 1280; // 13-inch laptop width

export function useResponsiveSidebar() {
  const { isMenuOpen, setMenuOpen } = useMenuState();
  const { isRightSidebarOpen, setIsRightSidebarOpen } = useRightSidebar();

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
      
      // Auto-close both sidebars on small screens
      if (isSmallScreen) {
        if (isMenuOpen) {
          setMenuOpen(false);
        }
        if (isRightSidebarOpen) {
          setIsRightSidebarOpen(false);
        }
      } else {
        // Auto-open sidebars on larger screens
        if (!isMenuOpen) {
          setMenuOpen(true);
        }
        if (!isRightSidebarOpen) {
          setIsRightSidebarOpen(true);
        }
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen, setMenuOpen, isRightSidebarOpen, setIsRightSidebarOpen]);

  return { 
    isMenuOpen, 
    setMenuOpen, 
    isRightSidebarOpen, 
    setIsRightSidebarOpen 
  };
}
