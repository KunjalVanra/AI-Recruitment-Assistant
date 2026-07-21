from fastapi import FastAPI, UploadFile, File, Query
import os
import shutil
import json
from groq_service import analyze_resume
from job_service import extract_job_skills
from database import engine
from database import SessionLocal
from models import Base, Candidate
from parser import extract_text_from_pdf
from scoring_service import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score
)

app = FastAPI(title="AI Recruitment Assistant")
Base.metadata.create_all(bind=engine)


UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "AI Recruitment Assistant API is Running!"
    }


@app.post("/upload_resume")
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


@app.get("/candidates")
def get_candidates(
    skill: str = Query(None),
    name: str = Query(None),
    experience: str = Query(None)
):

    db = SessionLocal()

    query = db.query(Candidate)

    if skill:
        query = query.filter(
            Candidate.skills.ilike(f"%{skill}%")
        )

    if name:
        query = query.filter(
            Candidate.name.ilike(f"%{name}%")
        )

    if experience:
        query = query.filter(
            Candidate.experience.ilike(f"%{experience}%")
        )

    candidates = query.all()

    result = []

    for candidate in candidates:
        result.append({
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "skills": candidate.skills,
            "experience": candidate.experience
        })

    db.close()

    return result

@app.get("/candidate/{candidate_id}")
def get_candidate(candidate_id: int):

    db = SessionLocal()

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        db.close()
        return {
            "message": "Candidate not found"
        }

    result = {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "phone": candidate.phone,
        "skills": candidate.skills,
        "education": candidate.education,
        "experience": candidate.experience,
        "resume_file": candidate.resume_file
    }

    db.close()

    return result

from pydantic import BaseModel


class CandidateUpdate(BaseModel):
    phone: str | None = None
    skills: str | None = None
    education: str | None = None
    experience: str | None = None


@app.put("/candidate/{candidate_id}")
def update_candidate(
    candidate_id: int,
    data: CandidateUpdate
):

    db = SessionLocal()

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )


    if not candidate:
        db.close()
        return {
            "message": "Candidate not found"
        }


    if data.phone:
        candidate.phone = data.phone

    if data.skills:
        candidate.skills = data.skills

    if data.education:
        candidate.education = data.education

    if data.experience:
        candidate.experience = data.experience


    db.commit()
    db.refresh(candidate)

    db.close()


    return {
        "message": "Candidate updated successfully",
        "candidate_id": candidate_id
    }

@app.delete("/candidate/{candidate_id}")
def delete_candidate(candidate_id: int):

    db = SessionLocal()

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        db.close()
        return {
            "message": "Candidate not found"
        }


    db.delete(candidate)
    db.commit()

    db.close()


    return {
        "message": "Candidate deleted successfully",
        "candidate_id": candidate_id
    }

@app.get("/rankings")
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
    experience_years = candidate.get(
    "experience_years",
    0
    )


    experience_score = calculate_experience_score(
        experience_years
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