from fastapi import FastAPI, UploadFile, File
import os
import shutil
import json
from groq_service import analyze_resume
from job_service import extract_job_skills
from parser import extract_text_from_pdf
from scoring_service import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score
)

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

from pydantic import BaseModel


class RankRequest(BaseModel):
    candidate_skills: list[str]
    required_skills: list[str]
    experience_years: int
    degree: str



@app.post("/rank_candidate")
def rank_candidate(data: RankRequest):

    # 1. Calculate skill score
    skill_result = calculate_skill_match(
        data.candidate_skills,
        data.required_skills
    )


    # 2. Calculate experience score
    experience_score = calculate_experience_score(
        data.experience_years
    )


    # 3. Calculate education score
    education_score = calculate_education_score(
        data.degree
    )


    # 4. Calculate overall score
    overall_result = calculate_overall_score(
        skill_result["skills_match"],
        experience_score,
        education_score
    )


    return {
        **skill_result,
        "experience_score": experience_score,
        "education_score": education_score,
        **overall_result
    }

from pydantic import BaseModel


class MatchRequest(BaseModel):
    candidate_skills: list[str]
    job_description: str



@app.post("/match_candidate")
def match_candidate(data: MatchRequest):

    # Extract skills from job description
    job_analysis = extract_job_skills(
        data.job_description
    )


    required_skills = job_analysis["required_skills"]


    # Compare candidate skills with job skills
    skill_result = calculate_skill_match(
        data.candidate_skills,
        required_skills
    )


    return {
        "required_skills": required_skills,
        **skill_result
    }

class EvaluateRequest(BaseModel):
    candidate_analysis: dict
    job_description: str



@app.post("/evaluate_candidate")
def evaluate_candidate(data: EvaluateRequest):

    candidate = data.candidate_analysis


    # Extract job requirements
    job_analysis = extract_job_skills(
        data.job_description
    )


    required_skills = job_analysis["required_skills"]


    # Candidate skills
    candidate_skills = candidate.get(
        "Skills",
        []
    )


    # Skill matching
    skill_result = calculate_skill_match(
        candidate_skills,
        required_skills
    )


    # Experience extraction
    experience_score = calculate_experience_score(
        1
    )


    # Education extraction
    education = candidate.get(
        "Education",
        []
    )


    if education:

        degree = education[0].get(
            "Degree",
            ""
        )

    else:
        degree = ""


    education_score = calculate_education_score(
        degree
    )


    # Overall score
    overall_result = calculate_overall_score(
        skill_result["skills_match"],
        experience_score,
        education_score
    )


    return {

        "job_requirements": job_analysis,

        **skill_result,

        "experience_score": experience_score,

        "education_score": education_score,

        **overall_result

    }