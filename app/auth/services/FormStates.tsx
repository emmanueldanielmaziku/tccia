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
  resetForm: () =>
    set((state) => ({
      formTypo: state.formTypo == "login" ? "reset" : "login",
    })),
}));

//Activate Account
interface ActivateAccountState {
  isActivated: boolean;
  setIsActivated: () => void;
}

export const useActivateAccountState = create<ActivateAccountState>((set) => ({
  isActivated: false,
  setIsActivated: () => set((state) => ({ isActivated: !state.isActivated })),
}));

// OTP Verification Flow
interface OtpVerificationState {
  otpActive: boolean;
  otpLogin: string | null;
  otpMessage: string | null;
  startOtp: (args: { login: string; message?: string | null }) => void;
  stopOtp: () => void;
}

export const useOtpVerificationState = create<OtpVerificationState>((set) => ({
  otpActive: false,
  otpLogin: null,
  otpMessage: null,
  startOtp: ({ login, message }) =>
    set({
      otpActive: true,
      otpLogin: login,
      otpMessage: message ?? null,
    }),
  stopOtp: () =>
    set({
      otpActive: false,
      otpLogin: null,
      otpMessage: null,
    }),
}));

// Password Change Flow
interface PasswordChangeState {
  passwordChangeActive: boolean;
  passwordChangeLogin: string | null;
  passwordChangeMessage: string | null;
  passwordChangeUserRole: string | null;
  startPasswordChange: (args: { login: string; message?: string | null; user_role?: string | null }) => void;
  stopPasswordChange: () => void;
}

export const usePasswordChangeState = create<PasswordChangeState>((set) => ({
  passwordChangeActive: false,
  passwordChangeLogin: null,
  passwordChangeMessage: null,
  passwordChangeUserRole: null,
  startPasswordChange: ({ login, message, user_role }) =>
    set({
      passwordChangeActive: true,
      passwordChangeLogin: login,
      passwordChangeMessage: message ?? null,
      passwordChangeUserRole: user_role ?? null,
    }),
  stopPasswordChange: () =>
    set({
      passwordChangeActive: false,
      passwordChangeLogin: null,
      passwordChangeMessage: null,
      passwordChangeUserRole: null,
    }),
}));
