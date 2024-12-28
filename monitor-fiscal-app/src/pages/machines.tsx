import { ServerStatusCard } from "../components/card-machine";
import { useGetMachinesQuery } from "../services/machines";
// const servers = [
//   {
//     id: "1",
//     name: "Servidor Alpha",
//     host: "192.168.1.100",
//     isUp: true,
//     engineStatus: "running" as const,
//     version: "v2.3.4",
//   },
//   {
//     id: "2",
//     name: "Servidor Beta",
//     host: "192.168.1.101",
//     isUp: true,
//     engineStatus: "error" as const,
//     version: "v2.3.3",
//   },
// ];
export const MachineScreen = () => {
  const { data: servers } = useGetMachinesQuery({});
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {servers?.map((machine) => (
          <ServerStatusCard key={machine.id} server={machine} />
        ))}
      </div>
    </div>
  );
};
