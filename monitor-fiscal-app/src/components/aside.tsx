import { Book, Clock, Cpu, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useFilterActions } from "../hook/handle-elements/hooks/actions";
import { useFilterState } from "../hook/handle-elements/hooks/filterState";

export const Aside = () => {
  const filters = useFilterState();
  const activeTab: any = filters?.filters?.aside;
  const { updateFilter } = useFilterActions();

  return (
    <aside className="w-64 bg-muted p-4">
      <nav className="space-y-2">
        <Button
          variant={activeTab === "machines" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() =>
            updateFilter({
              key: "aside",
              value: "machines",
            })
          }
        >
          <Cpu className="mr-2 h-4 w-4" />
          Máquinas
        </Button>
        <Button
          variant={activeTab === "playbooks" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() =>
            updateFilter({
              key: "aside",
              value: "playbooks",
            })
          }
        >
          <Book className="mr-2 h-4 w-4" />
          Playbooks
        </Button>
        <Button
          variant={activeTab === "versions" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() =>
            updateFilter({
              key: "aside",
              value: "versions",
            })
          }
        >
          <Upload className="mr-2 h-4 w-4" />
          Versões
        </Button>
        <Button
          variant={activeTab === "history" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() =>
            updateFilter({
              key: "aside",
              value: "history",
            })
          }
        >
          <Clock className="mr-2 h-4 w-4" />
          Histórico
        </Button>
      </nav>
    </aside>
  );
};
