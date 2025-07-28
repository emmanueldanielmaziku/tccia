"use client";

import { create } from "zustand";

interface AuthLayoutState {
  showHelpDesk: boolean;
  setShowHelpDesk: (show: boolean) => void;
}

export const useAuthLayoutState = create<AuthLayoutState>((set) => ({
  showHelpDesk: false,
  setShowHelpDesk: (show) => set({ showHelpDesk: show }),
})); 