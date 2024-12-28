/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Aside } from "./components/aside";
import { Header } from "./components/header";
import { useFilterState } from "./hook/handle-elements/hooks/filterState";
import { MachineScreen } from "./pages/machines";
import { useDispatch } from "react-redux";
import { apiSlice } from "./services/http";

export default function App() {
  const filters = useFilterState();
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Invalidating cache...");
      dispatch(apiSlice.util.invalidateTags(["Machine"])); // Invalida todas as tags
    }, 10000);

    return () => clearInterval(interval); // Limpa o intervalo quando o componente é desmontado
  }, [dispatch]);
  const renderContent = () => {
    switch (filters?.filters?.aside ?? "machines") {
      case "machines":
        return <MachineScreen />;
      case "playbooks":
        return <div>Conteúdo dos Playbooks</div>;
      case "versions":
        return <div>Lista de Versões</div>;
      case "history":
        return <div>Histórico</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background ">
      <Aside />
      <main className="flex-1 p-6 overflow-auto w-full">
        <Header />
        {/* <pre>{JSON.stringify(filters, null, 2)}</pre> */}

        {renderContent()}
      </main>
    </div>
  );
}
