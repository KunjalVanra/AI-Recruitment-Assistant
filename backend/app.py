from fastapi import FastAPI, UploadFile, File
import os
import shutil
import json
from groq_service import analyze_resume
from parser import extract_text_from_pdf
from scoring_service import calculate_skill_match

app = FastAPI(title="AI Recruitment Assistant")


UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "AI Recruitment Assistant API is Running!"
    }


@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )


    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )


    extracted_text = extract_text_from_pdf(file_path)


    analysis = analyze_resume(extracted_text)

    clean_analysis = analysis.replace("```json", "").replace("```", "").strip()

    return {
        "filename": file.filename,
        "resume_analysis": json.loads(clean_analysis)
    }

from pydantic import BaseModel


class ScoreRequest(BaseModel):
    candidate_skills: list[str]
    required_skills: list[str]


@app.post("/score_candidate")
def score_candidate(data: ScoreRequest):

    result = calculate_skill_match(
        data.candidate_skills,
        data.required_skills
    )

    return result