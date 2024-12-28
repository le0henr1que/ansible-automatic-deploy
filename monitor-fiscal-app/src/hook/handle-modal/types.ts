/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DialogModal {
  id: number;
  name: string;
}

export interface DialogModalState {
  isOpen?: boolean;
  element?: React.ReactNode | null;
  title?: any;
}
