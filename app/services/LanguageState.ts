import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "EN" | "SW";

interface LanguageState {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const useLangState = create<LanguageState>()(
  persist(
    (set) => ({
      language: "EN",
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === "EN" ? "SW" : "EN",
        })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "language-storage",
    }
  )
);

export default useLangState;
