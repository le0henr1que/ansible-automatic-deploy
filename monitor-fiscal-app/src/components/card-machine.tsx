/* eslint-disable react-hooks/rules-of-hooks */
import {
  Server,
  Check,
  X,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useDialogModal } from "../hook/handle-modal/hooks/actions";
import { ModalMachine } from "../pages/modal-machine";
import { useState } from "react";

interface ServerStatus {
  id: string;
  name: string;
  host: string;
  isUp: boolean;
  engineStatus: "running" | "stopped" | "error";
  version: string;
}

interface ServerStatusCardProps {
  server?: ServerStatus;
}

export function ServerStatusCard({ server }: any) {
  if (!server) {
    return (
      <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Erro: Dados do servidor não disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível carregar as informações do servidor.</p>
        </CardContent>
      </Card>
    );
  }

  const { handleModal } = useDialogModal();
  const handleAddMachine = () => {
    handleModal({
      isOpen: true,
      title: "Informações da Maquina",
      element: <ModalMachine modal={server} />,
    });
  };
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (isUp: boolean) =>
    isUp ? "bg-green-500" : "bg-red-500";

  const getEngineStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "stopped":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "deployment":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  const getEngineStatusText = (status: string) => {
    switch (status) {
      case "running":
        return "Rodando";
      case "stopped":
        return "Parado";
      case "deployment":
        return "Implementando";
      default:
        return "Desconhecido";
    }
  };
  return (
    <Card
      onClick={() => handleAddMachine()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full max-w-md cursor-pointer transition-all duration-300 ${
        isHovered ? "shadow-lg scale-105" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{server.name}</CardTitle>
        <Server className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status da Máquina</span>
            <Badge
              variant="outline"
              className={`${getStatusColor(server.isUp)} text-white`}
            >
              {server.isUp ? "Online" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Engine Fiscal</span>
            <div className="flex items-center space-x-2">
              {getEngineStatusIcon(server.engineStatus)}
              <span className="text-sm">
                {getEngineStatusText(server.engineStatus)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Versão</span>
            <span className="text-sm font-bold">{server.version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Host</span>
            <span className="text-sm">{server.host}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
