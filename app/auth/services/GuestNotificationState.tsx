"use client";

import { create } from "zustand";

export type ServiceKey =
  | "joinMembership"
  | "reportNonTariffBarrier"
  | "businessComplaints"
  | null;

interface GuestNotificationState {
  isVisible: boolean;
  serviceKey: ServiceKey;
  trigger: number;
  showNotification: (key: ServiceKey) => void;
  dismiss: () => void;
}

export const useGuestNotificationState = create<GuestNotificationState>(
  (set) => ({
    isVisible: false,
    serviceKey: null,
    trigger: 0,
    showNotification: (key) =>
      set((s) => ({ isVisible: true, serviceKey: key, trigger: s.trigger + 1 })),
    dismiss: () => set({ isVisible: false, serviceKey: null }),
  })
);
