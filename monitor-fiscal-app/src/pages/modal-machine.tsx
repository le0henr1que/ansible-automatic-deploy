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
  }" >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys && curl -X PUT "http://localhost:8000/machines/${
    (modal as any)?.id
  }/status" -H "Content-Type: application/json" -d '{"isUp": true}' || curl -X PUT "http://localhost:8000/machines/${
    (modal as any)?.id
  }/status" -H "Content-Type: application/json" -d '{"isUp": false}'`;
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const [isDeploying, setIsDeploying] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);

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
        "Ops! Ocorreu um erro ao testar a conexão. Certifique-se de que o servidor está online e a chave SSH foi configurada corretamente."
      );
      console.error(err);
    }
  };

  const [configureVersionMutation, { isLoading: isLoadingConfigureMutation }] =
    useConfigureVersionMutation({});

  const handleConfigVersion = async (id: string) => {
    try {
      setIsDeploying(true);
      setLogMessages([]);

      const ws = new WebSocket(
        `ws://localhost:8000/ws/machines/${id}/config?branch_name=main`
      );

      ws.onopen = () => {
        setLogMessages((prev) => [...prev, "[WebSocket] Conectado."]);
      };

      ws.onmessage = (event) => {
        setLogMessages((prev) => [...prev, event.data]);
        if (event.data.includes("✅ Deployment completed successfully")) {
          setIsDeploying(false);
          handleModal({ isOpen: false });
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setLogMessages((prev) => [...prev, "[WebSocket] Erro na conexão."]);
        setIsDeploying(false);
      };

      ws.onclose = () => {
        setLogMessages((prev) => [...prev, "[WebSocket] Conexão encerrada."]);
        setIsDeploying(false);
      };
    } catch (err) {
      alert(
        "Ops! Ocorreu um erro ao tentar iniciar a configuração da versão. Verifique a conexão."
      );
      console.error(err);
      setIsDeploying(false);
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
        <strong>Status da aplicação:</strong>{" "}
        {(modal as any)?.engineStatus as any}
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
        <Button
          onClick={() => handleConfigVersion(modal.id)}
          disabled={isDeploying}
        >
          {isDeploying
            ? "Implementando versão..."
            : "Implementar uma nova versão branch: main"}
        </Button>
      </div>

      {isDeploying && (
        <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-64 overflow-y-auto mt-4">
          {logMessages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
      )}

      <div className="flex w-full justify-end gap-4">
        <Button
          variant="destructive"
          onClick={() => {
            handleDeleteMachine(modal.id);
          }}
        >
          {isDeleting ? "Excluindo máquina..." : "Excluir máquina"}
        </Button>
      </div>
    </div>
  );
};
