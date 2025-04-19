from fastapi import APIRouter, Query, WebSocket, Depends, WebSocketDisconnect
from typing import List
from app.models.machine import Machine, MachineInDB, ConnectMachineResponse
from app.services.machine_service import MachineService
from app.interfaces.machine_repository import MachineRepository
from pydantic import BaseModel

router = APIRouter()

class MachineStatusUpdate(BaseModel):
    isUp: bool

def create_machine_controller(service: MachineService):
    @router.get("/", response_model=dict)
    async def read_root():
        return {"message": "Hello World"}
    
    @router.put("/machines/{machine_id}/status", response_model=MachineInDB)
    async def update_machine_status(
        machine_id: str,
        status_update: MachineStatusUpdate
    ):
        return await service.update_machine_status(machine_id, status_update.isUp)


    @router.post("/machines/", response_model=MachineInDB)
    async def create_machine(machine: Machine):
        return await service.create_machine(machine)

    @router.get("/machines/", response_model=List[MachineInDB])
    async def get_all_machines():
        return await service.get_all_machines()

    @router.get("/machines/{machine_id}", response_model=MachineInDB)
    async def get_machine(machine_id: str):
        return await service.get_machine(machine_id)

    @router.delete("/machines/{machine_id}", response_model=MachineInDB)
    async def delete_machine(machine_id: str):
        return await service.delete_machine(machine_id)

    @router.post("/machines/connect/{machine_id}", response_model=ConnectMachineResponse)
    async def connect_machine(machine_id: str):
        return await service.connect_machine(machine_id)

    @router.websocket("/ws/machines/{machine_id}/config")
    async def websocket_config(
        websocket: WebSocket,
        machine_id: str,
        branch_name: str = Query(...)
    ):
        await service.implement_new_version_ws(websocket, machine_id, branch_name)

    return router 