from pydantic import BaseModel
from typing import Optional

class Machine(BaseModel):
    name: str
    host: str
    isUp: bool  
    engineStatus: str
    version: str
    ssh_key: Optional[str] = ""
    healthcheck: Optional[str] = ""
    port: Optional[str] = "3333"

class MachineInDB(Machine):
    id: str

class ConnectMachineResponse(BaseModel):
    machine: MachineInDB 