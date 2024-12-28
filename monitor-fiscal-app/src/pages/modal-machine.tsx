/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import LogDisplay from "./log-display";
import { Check, Copy } from "lucide-react";
import { Badge } from "../components/ui/badge";
import BranchInput from "../components/branch-input";
import {
  useConfigureVersionMutation,
  useDeleteMachineMutation,
  useTestMachineMutation,
} from "../services/machines";
import { useDialogModalState } from "../hook/handle-modal/hooks/dialog-modal-state";
import { useDialogModal } from "../hook/handle-modal/hooks/actions";

export const ModalMachine = ({ modal }: any) => {
  const [copied, setCopied] = useState(false);
  const command = `apt update && apt install -y sudo && echo $PATH && service ssh start && mkdir -p ~/.ssh && echo "${
    (modal as any)?.ssh_key
  }" >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`;
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const initialLogs = [
    { timestamp: "2023-05-20T10:00:00Z", message: "System initialized" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const messages = ["Checking system status..."];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      document.dispatchEvent(
        new CustomEvent("addLog", { detail: randomMessage })
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);
  const getStatusColor = (isUp: boolean) => {
    return isUp ? "bg-green-500" : "bg-red-500";
  };
  const { handleModal } = useDialogModal();
  const [deleteMachine, { isLoading: isDeleting }] = useDeleteMachineMutation();

  const handleDeleteMachine = async (id: string) => {
    try {
      await deleteMachine(id).unwrap();
      alert("Máquina excluída com sucesso!");
      handleModal({ isOpen: false });
    } catch (err) {
      console.error(err);
    }
  };
  const [testMachine, { isLoading: isLoadingTest }] = useTestMachineMutation(
    {}
  );
  const handleTestMachine = async (id: string) => {
    try {
      await testMachine(id).unwrap();
      alert("Pong! Teste de conexão realizado com sucesso!");
      handleModal({ isOpen: false });
    } catch (err) {
      alert(
        "Ops! Ocorreu um erro ao testar a conexão. certifique-se de que o servidor está online e a chave SSH foi configurada corretamente."
      );
      console.error(err);
    }
  };

  const [configureVersionMutation, { isLoading: isLoadingConfigureMutation }] =
    useConfigureVersionMutation({});

  const handleConfigVersion = async (id: string) => {
    try {
      await configureVersionMutation({
        id,
        branch: "feat/xml-bitmap",
      }).unwrap();
      alert("Pong! Teste de conexão realizado com sucesso!");
      handleModal({ isOpen: false });
    } catch (err) {
      alert(
        "Ops! Ocorreu um erro ao testar a conexão. certifique-se de que o servidor está online e a chave SSH foi configurada corretamente."
      );
      console.error(err);
    }
  };
  return (
    <div className="grid gap-4 py-4">
      <div>
        <strong>Nome:</strong> {(modal as any)?.name as any}
      </div>
      <div>
        <strong>Versão Atual:</strong> {(modal as any)?.version as any}
      </div>
      <div>
        <strong>Servidor:</strong>{" "}
        <Badge
          variant="outline"
          className={`${getStatusColor(modal.isUp)} text-white`}
        >
          {modal.isUp ? "Online" : "Offline"}
        </Badge>
      </div>
      <div>
        <strong>Engine Fiscal:</strong> {(modal as any)?.engineStatus as any}
      </div>

      {(modal as any)?.status !== "CONECTADO" && (
        <div className="w-full">
          <div>
            <strong>SSH Key</strong>
            <p>
              Copie o comando abaixo e execute no servidor que irá servir como
              nó. O comando serve para ativar o SSH e salvar a chave de acesso.
            </p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
            <input
              type="text"
              value={command}
              readOnly
              className="flex-grow bg-transparent text-gray-800 font-mono text-sm focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className={`ml-2 p-2 rounded-md transition-all duration-300 ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              aria-label={
                copied ? "Copiado" : "Copiar para a área de transferência"
              }
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {(modal as any)?.status !== "CONECTADO" && (
          <Button onClick={() => handleTestMachine(modal.id)}>
            {isLoadingTest ? "Testando conexão..." : "Testar conexão"}
          </Button>
        )}
        <Button onClick={() => handleConfigVersion(modal.id)}>
          {isLoadingConfigureMutation
            ? "Configurando versão..."
            : "Implementar uma nova versão branch: feat/xml-bitmap"}
        </Button>
      </div>
      <div>
        <div>
          {(modal as any)?.status !== "CONECTADO" && (
            <LogDisplay initialLogs={initialLogs} />
          )}
        </div>
      </div>
      <div className="flex w-full justify-end gap-4">
        <Button
          variant="destructive"
          onClick={() => {
            handleDeleteMachine(modal.id);
          }}
        >
          {isDeleting ? "Excluindo maquina..." : "Excluir maquina"}
        </Button>
      </div>
    </div>
  );
};
