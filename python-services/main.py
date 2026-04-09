from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import process
import os
from dotenv import load_dotenv

load_dotenv()

# Create temp directory
os.makedirs(os.getenv("TEMP_DIR", "./temp"), exist_ok=True)

app = FastAPI(
    title="ClipAI Python Service",
    description="AI-powered video processing and clipping service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router)

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "message": "Python AI Service is running"
    }