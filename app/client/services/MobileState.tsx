import { create } from "zustand";

interface MobileState {
  isMobile: boolean;
  toggleMobileView: () => void;
}

const useMobileState = create<MobileState>((set) => ({
  isMobile: true,
  toggleMobileView: () => set((state) => ({ isMobile: !state.isMobile })),
}));

export default useMobileState;
