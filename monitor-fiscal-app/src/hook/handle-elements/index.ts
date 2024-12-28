import { createSlice } from "@reduxjs/toolkit";
import { FilterElementsAssignment } from "./types";

const INITIAL_STATE: FilterElementsAssignment = {
  filters: {
    meta: {
      page: 1,
    },
  },
};

const filterSlice = createSlice({
  name: "filter",
  initialState: INITIAL_STATE,
  reducers: {
    setFilter(state, action) {
      state.filters[action.payload.key] = action.payload.value;
    },
  },
});

export const { setFilter } = filterSlice.actions;
export default filterSlice.reducer;
