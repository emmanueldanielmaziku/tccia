import { create } from "zustand";

interface MenuState {
    isMenuOpen: boolean;
    toggleMenu: () => void;
    setMenuOpen: (open: boolean) => void;
}

const useMenuState = create<MenuState>((set) => ({
    isMenuOpen: true,
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    setMenuOpen: (open: boolean) => set({ isMenuOpen: open })
}));

export default useMenuState;