import { create } from "zustand";

interface MenuState {
    isMenuOpen: boolean;
    toggleMenu: () => void;
}

const useMenuState = create<MenuState>((set) => ({
    isMenuOpen: true,
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen }))
}));

export default useMenuState;