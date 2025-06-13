import { create } from "zustand";

//Defining States
interface FormState {
  formType: "login" | "register";
  toggleFormType: () => void;
}

//Creating Context
export const useFormState = create<FormState>((set) => ({
  formType: "login",
  toggleFormType: () =>
    set((state) => ({
      formType: state.formType == "login" ? "register" : "login",
    })),
}));

interface ResetFormState {
  formTypo: "login" | "reset";
  resetForm: () => void;
}

export const useResetFormState = create<ResetFormState>((set) => ({
  formTypo: "login",
  resetForm: () => set((state) => ({
      formTypo: state.formTypo == "login" ? "reset" : "login",
    })),
}));

//Activate Account
interface ActivateAccountState {
  isActivated: boolean;
  setIsActivated: () => void;
}

export const useActivateAccountState = create<ActivateAccountState>((set) => ({
  isActivated: true,
  setIsActivated: () => set((state) => ({ isActivated: !state.isActivated })),
}));