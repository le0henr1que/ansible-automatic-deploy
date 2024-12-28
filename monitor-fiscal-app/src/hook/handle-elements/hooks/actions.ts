import { useDispatch } from "react-redux";
import { setFilter } from "..";

export const useFilterActions = () => {
  const dispatch = useDispatch();
  const updateFilter: any = ({ key, value }: { key: string; value: any }) =>
    dispatch(setFilter({ key, value }));

  return { updateFilter };
};
