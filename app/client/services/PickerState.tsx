import { create } from "zustand";

interface PickerState {
  pickerState: boolean;
  togglePicker: () => void;
}

const usePickerState = create<PickerState>((set) => ({
  pickerState: true,
  togglePicker: () => set((state) => ({ pickerState: !state.pickerState }))
}));

export default usePickerState;