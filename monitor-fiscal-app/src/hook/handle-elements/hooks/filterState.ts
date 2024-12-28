import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../../store";

export const useFilterState = () => {
  const selectFilter = (state: ApplicationState) => state.handleElements;

  const filterState = useSelector(selectFilter);

  return useMemo(() => filterState, [filterState]);
};
