"use client";

import { create } from "zustand";

interface AuthLayoutState {
  showHelpDesk: boolean;
  setShowHelpDesk: (show: boolean) => void;
  showCertificateValidity: boolean;
  setShowCertificateValidity: (show: boolean) => void;
}

export const useAuthLayoutState = create<AuthLayoutState>((set) => ({
  showHelpDesk: false,
  setShowHelpDesk: (show) => set({ showHelpDesk: show }),
  showCertificateValidity: false,
  setShowCertificateValidity: (show) =>
    set({ showCertificateValidity: show }),
})); 