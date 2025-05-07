import { create } from "zustand";

interface FactoryVerificationState {
    isFactoryVerified: boolean;
    toggleVerificationForm: () => void;
}

const useFactoryVerificationState = create<FactoryVerificationState>((set) => ({
    isFactoryVerified: true,
    toggleVerificationForm: () => set((state) => ({ isFactoryVerified: !state.isFactoryVerified }))
}));

export default useFactoryVerificationState;