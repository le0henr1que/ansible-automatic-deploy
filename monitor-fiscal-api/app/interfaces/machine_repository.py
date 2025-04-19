from typing import List, Optional
from app.models.machine import Machine, MachineInDB

class MachineRepository:
    async def create(self, machine: Machine) -> MachineInDB:
        raise NotImplementedError
    
    async def get_all(self) -> List[MachineInDB]:
        raise NotImplementedError
    
    async def get_by_id(self, machine_id: str) -> Optional[MachineInDB]:
        raise NotImplementedError
    
    async def delete(self, machine_id: str) -> Optional[MachineInDB]:
        raise NotImplementedError
    
    async def update(self, machine_id: str, machine_data: dict) -> Optional[MachineInDB]:
        raise NotImplementedError 