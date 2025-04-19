/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useCreateMachineMutation } from "../services/machines";
import { useDialogModal } from "../hook/handle-modal/hooks/actions";

const schema = z.object({
  machineName: z.string().nonempty("Nome é obrigatório"),
  machineHost: z.string().nonempty("Host é obrigatório"),
  healthCheck: z.string().nonempty("Host é obrigatório"),
  port: z.string().nonempty("Porta é obrigatório"),
});

export const CreateMachine = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const { handleModal } = useDialogModal();
  const [createMachine, { isLoading }] = useCreateMachineMutation();
  const onSubmit = async (data: any) => {
    if (isLoading) return;
    try {
      await createMachine({
        name: data.machineName,
        host: data.machineHost,
        isUp: false,
        port: data.port,
        engineStatus: "error",
        version: "",
        ssh_key: "",
        healthcheck: data?.healthCheck,
      }).unwrap();
      handleModal({ isOpen: false });
      alert("Máquina criada com sucesso!");
    } catch (err) {
      alert("Máquina criada com sucesso!");
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4 w-[400px]">
        <div className="w-full flex flex-col gap-1 justify-start items-start">
          <label htmlFor="machine-name" className="text-right">
            Nome
          </label>
          <Controller
            name="machineName"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                id="machine-name"
                placeholder="Ex: Server 5"
                className="col-span-3"
              />
            )}
          />
          {errors.machineName && (
            <p className="text-red-500">
              {errors.machineName?.message as string}
            </p>
          )}
        </div>
        <div className="w-full flex flex-col gap-1 justify-start items-start">
          <label htmlFor="machine-host" className="text-right">
            Host
          </label>
          <Controller
            name="machineHost"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                id="machine-host"
                placeholder="Ex: 192.168.0.2"
                className="col-span-3"
              />
            )}
          />
          {errors.machineHost && (
            <p className="text-red-500">
              {errors.machineHost.message as string}
            </p>
          )}
        </div>
        <div className="w-full flex flex-col gap-1 justify-start items-start">
          <label htmlFor="machine-host" className="text-right">
            Porta
          </label>
          <Controller
            name="port"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                id="machine-host"
                placeholder="Ex: 3333"
                className="col-span-3"
              />
            )}
          />
          {errors.port && (
            <p className="text-red-500">{errors.port.message as string}</p>
          )}
        </div>
        <div className="w-full flex flex-col gap-1 justify-start items-start">
          <label htmlFor="machine-host" className="text-right">
            Rota Health Check
          </label>
          <Controller
            name="healthCheck"
            control={control}
            defaultValue="/health"
            render={({ field }) => (
              <Input
                {...field}
                id="machine-host"
                placeholder="Ex: 192.168.0.2"
                className="col-span-3"
              />
            )}
          />

          {errors.machineHost && (
            <p className="text-red-500">
              {errors.machineHost.message as string}
            </p>
          )}
        </div>
      </div>
      <Button type="submit">
        {isLoading ? "Criando Maquina..." : "Criar Maquina"}
      </Button>
    </form>
  );
};
