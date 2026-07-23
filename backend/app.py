from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Query
from pydantic import BaseModel
import os
import ast
import shutil
import json
# Database
from database import engine, SessionLocal
# Models
from models import (
    Base,
    Candidate,
    Job,
    CandidateRanking,
    Application,
    Recruiter,
)
# Services
from services.groq_service import analyze_resume
from services.job_service import extract_job_skills
from services.parser import extract_text_from_pdf
from services.scoring_service import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score,
    calculate_total_experience,
)
# Authentication utilities
from auth import hash_password, verify_password
# Routers
from routers.auth import router as auth_router
from routers.candidates import router as candidate_router
from routers.jobs import router as jobs_router
from routers.ai import router as ai_router
from routers.applications import router as applications_router
from routers.dashboard import router as dashboard_router


app = FastAPI(
    title="AI Recruitment Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(candidate_router)
app.include_router(jobs_router)
app.include_router(ai_router)
app.include_router(applications_router)
app.include_router(dashboard_router)


Base.metadata.create_all(bind=engine)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "AI Recruitment Assistant API is Running!"
    }







