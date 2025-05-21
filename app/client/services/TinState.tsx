import { create } from "zustand";

interface CompanyTinState {
  tinState: boolean;
  toggleCompanyTin: () => void;
}

const usetinState = create<CompanyTinState>((set) => ({
  tinState: false,
  toggleCompanyTin: () => set((state) => ({ tinState: !state.tinState })),
}));

export default usetinState;