import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useDialogModal } from "../hook/handle-modal/hooks/actions";
import { CreateMachine } from "../pages/create-machine";

export const Header = () => {
  const { handleModal } = useDialogModal();
  const handleAddMachine = () => {
    handleModal({
      isOpen: true,
      title: "Adicionar Nova Máquina",
      element: <CreateMachine />,
    });
  };
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Painel de Monitoramento</h1>
      <div className="space-x-2">
        <Button onClick={() => handleAddMachine()}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Máquina
        </Button>
      </div>
    </div>
  );
};
