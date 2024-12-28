import { useDispatch } from "react-redux";
import { open } from "..";
import { DialogModalState } from "../types";

export const useDialogModal = () => {
  const dispatch = useDispatch();

  const handleModal = (payload: DialogModalState) => {
    setTimeout(() => {
      dispatch(open(payload));
    }, 0);
  };

  return { handleModal };
};
