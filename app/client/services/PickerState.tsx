import { create } from "zustand";

interface PickerState {
  pickerState: boolean;
  togglePicker: () => void;
  initializePicker: () => void;
  forceShowPicker: () => void;
  hidePicker: () => void;
}

const usePickerState = create<PickerState>((set) => ({
  pickerState: false,
  togglePicker: () => set((state) => ({ pickerState: !state.pickerState })),
  initializePicker: () => {
    const selectedCompany = localStorage.getItem("selectedCompany");
    set({ pickerState: !selectedCompany });
  },
  forceShowPicker: () => set({ pickerState: true }),
  hidePicker: () => set({ pickerState: false }),
}));

export default usePickerState;
