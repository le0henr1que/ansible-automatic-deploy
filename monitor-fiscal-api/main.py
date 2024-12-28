import subprocess
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional
import asyncio
import os
import httpx

# import schedule
# import time

MONGO_URI = "mongodb://mongo:27017"  # Atualize para usar o nome do serviço MongoDB no docker-compose
DATABASE_NAME = "mydatabase"
COLLECTION_NAME = "machines"

# Inicializa o cliente MongoDB
client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# Inicializa o FastAPI
app = FastAPI()

# Configuração do CORS
origins = [
    "*",  # Adicione o endereço do seu frontend aqui
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de dados para a máquina
class Machine(BaseModel):
    name: str
    host: str
    isUp: bool  # Remova a vírgula aqui
    engineStatus: str
    version: str
    ssh_key: Optional[str] = ""
    healthcheck: Optional[str] = ""

class MachineInDB(Machine):
    id: str

# Exemplo de rota
@app.get("/")
async def read_root():
    return {"message": "Hello World"}

def add_line_to_file(file_path: str, line: str, implemented: bool):
    section_implemented = "[implemented]"
    section_not_implemented = "[not-implemented]"

    # Ler o conteúdo do arquivo
    with open(file_path, 'r') as file:
        lines = file.readlines()

    # Remover todas as ocorrências da linha
    filtered_lines = []
    for i in range(len(lines)):
        if lines[i].strip() == line.strip():
            continue  # Ignora a linha
        # Também ignora a seção se for seguida pela linha alvo
        if i > 0 and lines[i - 1].strip() in [section_implemented, section_not_implemented] and lines[i].strip() == line:
            continue
        filtered_lines.append(lines[i])

    # Adicionar a linha na seção correta
    if implemented:
        # Garantir que a seção [implemented] existe
        if section_implemented not in [l.strip() for l in filtered_lines]:
            filtered_lines.append(section_implemented + '\n')
        # Adicionar a linha à seção [implemented]
        section_index = filtered_lines.index(section_implemented + '\n') + 1
        filtered_lines.insert(section_index, line.strip() + '\n')
    else:
        # Garantir que a seção [not-implemented] existe
        if section_not_implemented not in [l.strip() for l in filtered_lines]:
            filtered_lines.append(section_not_implemented + '\n')
        # Adicionar a linha à seção [not-implemented]
        section_index = filtered_lines.index(section_not_implemented + '\n') + 1
        filtered_lines.insert(section_index, line.strip() + '\n')

    # Escrever o conteúdo atualizado no arquivo
    with open(file_path, 'w') as file:
        file.writelines(filtered_lines)

def run_shell_command(command: str):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Command failed with error: {result.stderr}")
    return result.stdout

def generate_ssh_key():
    private_key_path = "/root/.ssh/id_rsa"
    public_key_path = "/root/.ssh/id_rsa.pub"
    
    try:
        # Verificando se as chaves já existem
        if os.path.exists(private_key_path) and os.path.exists(public_key_path):
            print("Chaves já existem. Retornando a chave pública...")
            result = subprocess.run(f"cat {public_key_path}", shell=True, capture_output=True, text=True, check=True)
            return result.stdout
        else:
            print("Gerando novas chaves SSH...")

            # Gerando as chaves SSH
            result = subprocess.run("ssh-keygen -t rsa -b 2048 -f /root/.ssh/id_rsa -N ''", 
                                    shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Erro ao gerar chaves: {result.stderr}")
                return None

            # Verificar se a chave pública foi criada corretamente
            if not os.path.exists(public_key_path):
                print(f"Erro: A chave pública não foi criada em {public_key_path}")
                return None

            # Retornar a chave pública
            result = subprocess.run(f"cat {public_key_path}", shell=True, capture_output=True, text=True, check=True)
            return result.stdout

    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar subprocesso: {e}")
        return None
    except Exception as e:
        print(f"Erro inesperado: {e}")
        return None

# Rota para inserir uma nova máquina
@app.post("/machines/", response_model=MachineInDB)
async def create_machine(machine: Machine):
    result = await collection.insert_one(machine.dict())
    if result.inserted_id:
        file_path = 'hosts'  
        line = machine.host  
        add_line_to_file(file_path, line, False)
        
        try:
            ssh_key = generate_ssh_key()
            print(f"Generated SSH Key: {ssh_key}")
            
            await collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"ssh_key": ssh_key, "status": "Não Iniciado"}}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        machine_data = machine.dict()
        machine_data["id"] = str(result.inserted_id)
        machine_data["ssh_key"] = ssh_key
        machine_in_db = MachineInDB(**machine_data)
        return machine_in_db
    raise HTTPException(status_code=500, detail="Failed to insert machine")

@app.get("/machines/", response_model=List[MachineInDB])
async def get_all_machines():
    machines = []
    async for machine in collection.find():
        if "host" not in machine:
            machine["host"] = "unknown"
        machines.append(MachineInDB(**machine, id=str(machine["_id"])))
    return machines

@app.get("/machines/{machine_id}", response_model=MachineInDB)
async def get_machine(machine_id: str):
    machine = await collection.find_one({"_id": ObjectId(machine_id)})
    if machine:
        if "host" not in machine:
            machine["host"] = "unknown"
        return MachineInDB(**machine, id=str(machine["_id"]))
    raise HTTPException(status_code=404, detail="Machine not found")

@app.delete("/machines/{machine_id}", response_model=MachineInDB)
async def delete_machine(machine_id: str):
    machine = await collection.find_one({"_id": ObjectId(machine_id)})
    if machine:
        await collection.delete_one({"_id": ObjectId(machine_id)})
        return MachineInDB(**machine, id=str(machine["_id"]))
    raise HTTPException(status_code=404, detail="Machine not found")

# Modelo que representa os dados da máquina no banco de dados
class MachineInDB(BaseModel):
    id: str
    name: str
    host: str
    isUp: bool  # Remova a vírgula aqui
    engineStatus: str
    version: str
    ssh_key: Optional[str] = ""
    healthcheck: Optional[str] = ""

# Modelo de resposta que inclui o output do comando Ansible
class ConnectMachineResponse(BaseModel):
    machine: MachineInDB


@app.post("/machines/connect/{machine_id}", response_model=ConnectMachineResponse)
async def connect_machine(machine_id: str):
    machine = await collection.find_one({"_id": ObjectId(machine_id)})
    
    if machine:
        host = machine.get('host')
        if not host:
            raise HTTPException(status_code=404, detail="Host not found for the machine")

        print(f"Connecting to host: {host}")
        
        command = f"ansible -i hosts {host} -m ping --ssh-common-args='-o StrictHostKeyChecking=no'"
        print(command)
        try:
            process = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            output = process.stdout
            print(output)
            
            # Verifica se a mensagem foi "Conectado"
            if "ping\": \"pong\"" in output:
                # Atualiza o status da máquina no banco de dados
                await collection.update_one({"_id": ObjectId(machine_id)}, {"$set": {"isUp": True}})
                machine['isUp'] = True
                
                # Prepara o retorno com o output e os dados da máquina
                return ConnectMachineResponse(
                    machine=MachineInDB(
                        id=str(machine['_id']),
                        name=machine['name'],
                        host=machine.get('host', ''),
                        isUp=machine['isUp'],
                        engineStatus=machine.get('engineStatus', ''),
                        version=machine.get('version', ''),
                        ssh_key=machine.get('ssh_key', '')
                    ),
                    output=output,
   
                )
            # Atualiza o status da máquina no banco de dados
            await collection.update_one({"_id": ObjectId(machine_id)}, {"$set": {"isUp": False}})
            machine['isUp'] = False
                
            return ConnectMachineResponse(
                    machine=MachineInDB(
                        id=str(machine['_id']),
                        name=machine['name'],
                        host=machine.get('host', ''),
                        isUp=machine['isUp'],
                        engineStatus=machine.get('engineStatus', ''),
                        version=machine.get('version', ''),
                        ssh_key=machine.get('ssh_key', '')
                    ),
                    output=output,
            )

        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Ansible command failed: {e.stderr}")
    
    raise HTTPException(status_code=404, detail="Machine not found")

@app.post("/machines/{machine_id}/config", response_model=ConnectMachineResponse)
async def implement_new_version(machine_id: str, branch_name: str = Query(...)):
    machine = await collection.find_one({"_id": ObjectId(machine_id)})
    
    if machine:
        host = machine.get('host')
        if not host:
            raise HTTPException(status_code=404, detail="Host not found for the machine")

        print(f"Connecting to host: {host}")
        
        # Atualiza o status inicial para "deployment"
        await collection.update_one({"_id": ObjectId(machine_id)}, {"$set": {"engineStatus": "deployment"}})

        # Função para rodar o comando ansible de forma assíncrona
        async def run_ansible():
            command = f"ansible-playbook -i hosts playbooks/configure-version.yml --extra-vars 'target_hosts={host.strip()} branch_name={branch_name.strip()}' --ssh-common-args='-o StrictHostKeyChecking=no'"
            print(command)
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                text=False  # Garanta que 'text' seja False
            )

            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                # Se o comando foi bem-sucedido, atualiza o status para "running"
                await collection.update_one({"_id": ObjectId(machine_id)}, {"$set": {"engineStatus": "running", "version": branch_name}})
                machine['version'] = branch_name
                machine['engineStatus'] = "running"
                add_line_to_file(file_path, line, True)
                return stdout
            else:
                # Se o comando falhou, atualiza o status para "error"
                await collection.update_one({"_id": ObjectId(machine_id)}, {"$set": {"engineStatus": "error"}})
                machine['engineStatus'] = "error"
                add_line_to_file(file_path, line, False)
                raise HTTPException(status_code=500, detail=f"Ansible command failed: {stderr.decode('utf-8')}")
        
        # Chama a função de execução do Ansible sem bloquear a execução
        asyncio.create_task(run_ansible())

        return ConnectMachineResponse(
            machine=MachineInDB(
                id=str(machine['_id']),
                name=machine['name'],
                description=machine.get('description', ''),
                status=machine['status'],
                ssh_key=machine.get('ssh_key', ''),
                version=machine.get('version', ''),
                host=machine['host'],
                isUp=machine['isUp'],
                engineStatus=machine['engineStatus']
            ),
            output="Deployment initiated, the process is running in the background."
        )

    raise HTTPException(status_code=404, detail="Machine not found")


    machines = []
    async for machine in collection.find():
        if "host" not in machine:
            machine["host"] = "unknown"
        host_path = f"http://{machine['host']}:8080{machine['healthcheck']}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(host_path)
                if response.status_code == 200:
                    machine["engineStatus"] = "running"
                else:
                    machine["engineStatus"] = "error"
        except httpx.RequestError:
            machine["engineStatus"] = "error"
        print(host_path)
        machines.append(machine)
        # Update the machine status in the database
        await collection.update_one({"_id": machine["_id"]}, {"$set": {"engineStatus": machine["engineStatus"]}})

    if not machines:
        return {"machines": []}

    return {"machines": machines}

# def minha_tarefa():
#     print("Executando a tarefa agendada!")

# # Agendar a tarefa para rodar a cada 1 minuto
# schedule.every(1).minute.do(minha_tarefa)

# # Agendar para um horário específico (por exemplo, 14:00)
# # schedule.every().day.at("14:00").do(minha_tarefa)

# while True:
#     schedule.run_pending()
#     time.sleep(1)