"use client";

import { create } from "zustand";

interface AuthLayoutState {
  showNTB: boolean;
  setShowNTB: (show: boolean) => void;
}

export const useAuthLayoutState = create<AuthLayoutState>((set) => ({
  showNTB: false,
  setShowNTB: (show) => set({ showNTB: show }),
}));
