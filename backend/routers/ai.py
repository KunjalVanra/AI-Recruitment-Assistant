from fastapi import APIRouter, UploadFile, File
import os
import shutil
import json

from database import SessionLocal
from models import Candidate
from services.scoring_service import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score,
)

from services.job_service import extract_job_skills
from services.parser import extract_text_from_pdf
from services.groq_service import analyze_resume

from schemas.ai import (
    ScoreRequest,
    RankRequest,
    MatchRequest,
    EvaluateRequest,
)

router = APIRouter(
    prefix="/ai",
    tags=["AI Services"]
)
router = APIRouter(
    prefix="/ai",
    tags=["AI Services"]
)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)



@router.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):

    # Save uploaded PDF
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from PDF
    extracted_text = extract_text_from_pdf(file_path)

    # Analyze resume using Groq
    analysis = analyze_resume(extracted_text)

    # Convert JSON string to Python dictionary
    if isinstance(analysis, str):
        clean_analysis = (
            analysis
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        analysis = json.loads(clean_analysis)

    db = SessionLocal()

    # Check if candidate already exists
    existing_candidate = (
        db.query(Candidate)
        .filter(Candidate.email == analysis.get("Email"))
        .first()
    )

    if existing_candidate:
        db.close()
        return {
            "message": "Candidate already exists",
            "candidate_id": existing_candidate.id
        }

    # Create new candidate
    candidate = Candidate(
        name=analysis.get("Name"),
        email=analysis.get("Email"),
        phone=analysis.get("Phone"),
        skills=", ".join(analysis.get("Skills", [])),
        education=str(analysis.get("Education")),
        experience=str(analysis.get("Experience")),
        resume_file=file.filename
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    db.close()

    return {
        "message": "Resume uploaded successfully",
        "candidate_id": candidate.id,
        "resume_analysis": analysis
    }

@router.post("/evaluate_candidate")
def evaluate_candidate(data: EvaluateRequest):

    candidate = data.candidate_analysis

    job_analysis = extract_job_skills(
        data.job_description
    )

    required_skills = job_analysis["required_skills"]

    candidate_skills = candidate.get(
        "Skills",
        []
    )

    skill_result = calculate_skill_match(
        candidate_skills,
        required_skills
    )

    experience_years = candidate.get(
        "experience_years",
        0
    )

    experience_score = calculate_experience_score(
        experience_years
    )

    education = candidate.get(
        "Education",
        []
    )

    if education:
        degree = education[0].get("Degree", "")
    else:
        degree = ""

    education_score = calculate_education_score(
        degree
    )

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

@router.post("/match_candidate")
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


@router.post("/score_candidate")
def score_candidate(data: ScoreRequest):

    result = calculate_skill_match(
        data.candidate_skills,
        data.required_skills
    )

    return result

@router.post("/rank_candidate")
def rank_candidate(data: RankRequest):

    # Calculate skill score
    skill_result = calculate_skill_match(
        data.candidate_skills,
        data.required_skills
    )

    # Calculate experience score
    experience_score = calculate_experience_score(
        data.experience_years
    )

    # Calculate education score
    education_score = calculate_education_score(
        data.degree
    )

    # Calculate overall score
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


@router.get("/rankings")
def get_rankings():

    db = SessionLocal()

    candidates = db.query(Candidate).all()

    rankings = []


    for candidate in candidates:

        # Convert stored skills string into list
        candidate_skills = [
            skill.strip()
            for skill in candidate.skills.split(",")
        ]


        # For now, compare against common backend skills
        required_skills = [
            "Python",
            "FastAPI",
            "SQL",
            "AWS"
        ]


        # Skill score
        skill_result = calculate_skill_match(
            candidate_skills,
            required_skills
        )


        # Experience score
        experience_score = 0

        if candidate.experience:
            experience_score = calculate_experience_score(
                2
            )


        # Education score
        education_score = calculate_education_score(
            candidate.education
        )


        # Overall score
        overall = calculate_overall_score(
            skill_result["skills_match"],
            experience_score,
            education_score
        )


        rankings.append({
            "id": candidate.id,
            "name": candidate.name,
            "overall_score": overall["overall_score"],
            "recommendation": overall["recommendation"]
        })


    db.close()


    # Sort highest score first
    rankings.sort(
        key=lambda x: x["overall_score"],
        reverse=True
    )


    return rankings

