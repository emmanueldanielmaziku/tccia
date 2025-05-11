import { create } from "zustand";

interface LangState {
  language: "EN" | "SW";
  toggleLanguage: () => void;
}

const useLangState = create<LangState>((set) => ({
  language: "EN",
  toggleLanguage: () =>
    set((state) => ({ language: state.language === "EN" ? "SW" : "EN" })),
}));

export default useLangState;
