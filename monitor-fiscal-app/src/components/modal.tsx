import { useEffect, useRef } from "react";
import { useDialogModalState } from "../hook/handle-modal/hooks/dialog-modal-state";
import { useDialogModal } from "../hook/handle-modal/hooks/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export function Modal() {
  const { isOpen, element, title } = useDialogModalState();
  const { handleModal } = useDialogModal();

  // Referência para restaurar o foco ao fechar
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    console.log("Fechando modal...");
    handleModal({
      isOpen: false,
      element: null,
      title: "",
    });
  };

  // Restaurar o foco ao fechar o modal
  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isOpen]);

  // Garantir que o scroll seja restaurado ao fechar
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Bloqueia o scroll
    } else {
      document.body.style.overflow = ""; // Libera o scroll
    }

    // Limpeza para garantir que o estilo seja removido
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="w-max max-w-max bg-white transition-none">
        <DialogHeader className="w-full">
          {typeof title === "string" ? (
            <DialogTitle className="]">{title}</DialogTitle>
          ) : (
            title
          )}
        </DialogHeader>
        <div className="grid gap-4">
          {!element ? (
            <div className="flex w-full items-center justify-center">
              <p>Carregando...</p>
            </div>
          ) : (
            <div>{element}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
