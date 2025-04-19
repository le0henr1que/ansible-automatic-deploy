from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from app.repositories.mongodb_machine_repository import MongoDBMachineRepository
from app.services.machine_service import MachineService
from app.controllers.machine_controller import create_machine_controller

MONGO_URI = "mongodb://mongo:27017"  
DATABASE_NAME = "mydatabase"
COLLECTION_NAME = "machines"

app = FastAPI()

# Configure CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URI)

# Create repository
repository = MongoDBMachineRepository(client, DATABASE_NAME, COLLECTION_NAME)

# Create service
service = MachineService(repository)

# Create and include router
router = create_machine_controller(service)
app.include_router(router)

