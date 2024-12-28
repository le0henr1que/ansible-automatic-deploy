import { useSelector } from "react-redux";
import { ApplicationState } from "../../../store";

export const useDialogModalState = () => {
  return useSelector((state: ApplicationState) => state.dialogModal);
};
