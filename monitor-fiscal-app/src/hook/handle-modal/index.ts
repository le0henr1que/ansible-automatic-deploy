// dialogModalSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DialogModalState } from "./types";

const initialState: DialogModalState = {
  isOpen: false,
  element: null,
  title: "",
};

const dialogModalSlice = createSlice({
  name: "dialogModal",
  initialState,
  reducers: {
    open(state, action: PayloadAction<DialogModalState>) {
      state.isOpen = action.payload.isOpen;
      state.element = action.payload.element;
      state.title = action.payload.title;
    },
  },
});

export const { open } = dialogModalSlice.actions;
export default dialogModalSlice.reducer;
