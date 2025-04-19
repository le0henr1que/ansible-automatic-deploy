import { ServerStatusCard } from "../components/card-machine";
import { useGetMachinesQuery } from "../services/machines";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useDialogModal } from "../hook/handle-modal/hooks/actions";
import { CreateMachine } from "./create-machine";

interface Machine {
  id: string;
  name: string;
  host: string;
  isUp: boolean;
  engineStatus: string;
  version: string;
}

export const MachineScreen = () => {
  const { data: servers } = useGetMachinesQuery({});
  const { handleModal } = useDialogModal();

  const handleAddMachine = () => {
    handleModal({
      isOpen: true,
      title: "Adicionar Nova Máquina",
      element: <CreateMachine />,
    });
  };

  if (!servers || servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-lg text-gray-600">Nenhuma máquina cadastrada</p>
        <Button onClick={handleAddMachine}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Máquina
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {servers.map((machine: Machine) => (
          <ServerStatusCard key={machine.id} server={machine} />
        ))}
      </div>
    </div>
  );
};
