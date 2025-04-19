from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional
from app.models.machine import Machine, MachineInDB
from app.interfaces.machine_repository import MachineRepository

class MongoDBMachineRepository(MachineRepository):
    def __init__(self, client: AsyncIOMotorClient, database_name: str, collection_name: str):
        self.db = client[database_name]
        self.collection = self.db[collection_name]

    async def create(self, machine: Machine) -> MachineInDB:
        result = await self.collection.insert_one(machine.dict())
        if result.inserted_id:
            machine_data = machine.dict()
            machine_data["id"] = str(result.inserted_id)
            return MachineInDB(**machine_data)
        raise Exception("Failed to insert machine")

    async def get_all(self) -> List[MachineInDB]:
        machines = []
        async for machine in self.collection.find():
            if "host" not in machine:
                machine["host"] = "unknown"
            machines.append(MachineInDB(**machine, id=str(machine["_id"])))
        return machines

    async def get_by_id(self, machine_id: str) -> Optional[MachineInDB]:
        machine = await self.collection.find_one({"_id": ObjectId(machine_id)})
        if machine:
            if "host" not in machine:
                machine["host"] = "unknown"
            return MachineInDB(**machine, id=str(machine["_id"]))
        return None

    async def delete(self, machine_id: str) -> Optional[MachineInDB]:
        machine = await self.collection.find_one({"_id": ObjectId(machine_id)})
        if machine:
            await self.collection.delete_one({"_id": ObjectId(machine_id)})
            return MachineInDB(**machine, id=str(machine["_id"]))
        return None

    async def update(self, machine_id: str, machine_data: dict) -> Optional[MachineInDB]:
        machine = await self.collection.find_one({"_id": ObjectId(machine_id)})
        if machine:
            await self.collection.update_one(
                {"_id": ObjectId(machine_id)},
                {"$set": machine_data}
            )
            updated_machine = await self.get_by_id(machine_id)
            return updated_machine
        return None 