import subprocess
import asyncio
import os
from typing import List, Optional, AsyncGenerator
from fastapi import HTTPException
from app.models.machine import Machine, MachineInDB, ConnectMachineResponse
from app.interfaces.machine_repository import MachineRepository
from fastapi import WebSocket
from fastapi.exceptions import HTTPException

class MachineService:
    def __init__(self, repository: MachineRepository):
        self.repository = repository

    async def create_machine(self, machine: Machine) -> MachineInDB:
        try:
            ssh_key = self._generate_ssh_key()
            machine_data = machine.dict()
            machine_data["ssh_key"] = ssh_key
            machine_data["status"] = "Não Iniciado"
            
            created_machine = await self.repository.create(Machine(**machine_data))
            self._add_line_to_file('hosts', machine.host, False)
            return created_machine
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_all_machines(self) -> List[MachineInDB]:
        return await self.repository.get_all()

    async def get_machine(self, machine_id: str) -> MachineInDB:
        machine = await self.repository.get_by_id(machine_id)
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        return machine

    async def delete_machine(self, machine_id: str) -> MachineInDB:
        machine = await self.repository.delete(machine_id)
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        return machine

    async def connect_machine(self, machine_id: str) -> ConnectMachineResponse:
        machine = await self.get_machine(machine_id)
        
        host = machine.host
        if not host:
            raise HTTPException(status_code=404, detail="Host not found for the machine")

        command = f"ansible -i hosts {host} -m ping --ssh-common-args='-o StrictHostKeyChecking=no'"
        print(command)
        try:
            process = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            output = process.stdout
            
            is_up = "ping\": \"pong\"" in output
            await self.repository.update(machine_id, {"isUp": is_up})
            machine.isUp = is_up
            
            return ConnectMachineResponse(machine=machine)
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Ansible command failed: {e.stderr}")

    async def implement_new_version_ws(self, websocket: WebSocket, machine_id: str, branch_name: str):
        await websocket.accept()

        try:
            machine = await self.repository.get_by_id(machine_id)
            if not machine:
                await websocket.send_text("❌ Machine not found")
                await websocket.close()
                return

            host = machine.host
            if not host:
                await websocket.send_text("❌ Host not found for the machine")
                await websocket.close()
                return

            await self.repository.update(machine_id, {"engineStatus": "deployment"})
            await websocket.send_text(f"🔄 Starting deployment on {host}...")

            sanitized_host = host
            command = (
                f"ansible-playbook -i hosts playbooks/configure-version.yml "
                f"--extra-vars 'target_hosts={sanitized_host} branch_name={branch_name.strip()}' "
                f"--ssh-common-args='-o StrictHostKeyChecking=no'"
            )

            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT
            )

            return_code = None
            try:
                while True:
                    # Wait for either output or process completion
                    done, pending = await asyncio.wait(
                        [
                            asyncio.create_task(process.stdout.readline()),
                            asyncio.create_task(process.wait()),
                        ],
                        return_when=asyncio.FIRST_COMPLETED
                    )
                    
                    # Check if process completed
                    if process.returncode is not None:
                        return_code = process.returncode
                        break
                        
                    # Handle output if available
                    read_task = next((t for t in done if t is not process.wait()), None)
                    if read_task:
                        line = await read_task
                        if line:
                            await websocket.send_text(line.decode("utf-8").rstrip())
                        else:
                            # No more output
                            break

                    # Cancel any pending tasks to avoid warnings
                    for task in pending:
                        task.cancel()

            except Exception as e:
                await self.repository.update(machine_id, {"engineStatus": "error"})
                await websocket.send_text(f"❌ Error during deployment: {str(e)}")
                return_code = 1  # Indicate failure
            finally:
                # Ensure process is terminated
                if process.returncode is None:
                    process.terminate()
                    try:
                        await asyncio.wait_for(process.wait(), timeout=5.0)
                    except asyncio.TimeoutError:
                        process.kill()
                        await process.wait()
            print(return_code)
            if return_code == 0:
                await self.repository.update(machine_id, {
                    "engineStatus": "running",
                    "version": branch_name,
                    "status": "ok"
                })
                await websocket.send_text("✅ Deployment completed successfully")
                await websocket.send_text("✅ Status updated to OK")
            else:
                await self.repository.update(machine_id, {"engineStatus": "error"})
                await websocket.send_text(f"❌ Deployment failed with return code: {return_code}")

        except Exception as e:
            await self.repository.update(machine_id, {"engineStatus": "error"})
            await websocket.send_text(f"❌ Unexpected error: {str(e)}")
        finally:
            await websocket.close()

    async def update_machine_status(self, machine_id: str, is_up: bool) -> MachineInDB:
        machine = await self.get_machine(machine_id)
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        
        await self.repository.update(machine_id, {"isUp": is_up})
        machine.isUp = is_up
        return machine

    def _generate_ssh_key(self) -> str:
        private_key_path = "/root/.ssh/id_rsa"
        public_key_path = "/root/.ssh/id_rsa.pub"
        
        try:
            if os.path.exists(private_key_path) and os.path.exists(public_key_path):
                result = subprocess.run(f"cat {public_key_path}", shell=True, capture_output=True, text=True, check=True)
                return result.stdout
            else:
                result = subprocess.run("ssh-keygen -t rsa -b 2048 -f /root/.ssh/id_rsa -N ''", 
                                    shell=True, capture_output=True, text=True)
                if result.returncode != 0:
                    raise Exception(f"Error generating keys: {result.stderr}")

                if not os.path.exists(public_key_path):
                    raise Exception(f"Error: Public key not created at {public_key_path}")

                result = subprocess.run(f"cat {public_key_path}", shell=True, capture_output=True, text=True, check=True)
                return result.stdout
        except subprocess.CalledProcessError as e:
            raise Exception(f"Error executing subprocess: {e}")
        except Exception as e:
            raise Exception(f"Unexpected error: {e}")

    def _add_line_to_file(self, file_path: str, line: str, implemented: bool):
        section_implemented = "[implemented]"
        section_not_implemented = "[not-implemented]"

        with open(file_path, 'r') as file:
            lines = file.readlines()

        filtered_lines = []
        for i in range(len(lines)):
            if lines[i].strip() == line.strip():
                continue
            if i > 0 and lines[i - 1].strip() in [section_implemented, section_not_implemented] and lines[i].strip() == line:
                continue
            filtered_lines.append(lines[i])

        if implemented:
            if section_implemented not in [l.strip() for l in filtered_lines]:
                filtered_lines.append(section_implemented + '\n')
            section_index = filtered_lines.index(section_implemented + '\n') + 1
            filtered_lines.insert(section_index, line.strip() + '\n')
        else:
            if section_not_implemented not in [l.strip() for l in filtered_lines]:
                filtered_lines.append(section_not_implemented + '\n')
            section_index = filtered_lines.index(section_not_implemented + '\n') + 1
            filtered_lines.insert(section_index, line.strip() + '\n')

        with open(file_path, 'w') as file:
            file.writelines(filtered_lines) 