import { create } from "zustand";

interface LogState {
  alertState: boolean;
  toggleAlert: () => void;
}

const useLogState = create<LogState>((set) => ({
  alertState: false,
  toggleAlert: () => set((state) => ({ alertState: !state.alertState }))
}));

export default useLogState;