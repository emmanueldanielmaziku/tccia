import { create } from "zustand";

interface CompanyTinFormState {
  tinformState: boolean;
  toggleCompanyTinForm: () => void;
}

const usetinFormState = create<CompanyTinFormState>((set) => ({
  tinformState: false,
  toggleCompanyTinForm: () =>
    set((state) => ({ tinformState: !state.tinformState })),
}));

export default usetinFormState;
