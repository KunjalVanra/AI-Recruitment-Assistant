from fastapi import FastAPI, UploadFile, File, Query
import os
import ast
import shutil
import json
from groq_service import analyze_resume
from job_service import extract_job_skills
from database import engine, SessionLocal
from models import Base, Candidate, Job, CandidateRanking, Application, Recruiter
from parser import extract_text_from_pdf
from scoring_service import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score,
    calculate_total_experience
)
from auth import hash_password


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

class JobRequest(BaseModel):
    title: str
    description: str

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

class RecruiterRequest(BaseModel):

    name: str
    email: str
    password: str


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

@app.post("/jobs")
def create_job(data: JobRequest):

    db = SessionLocal()

    # Extract job requirements using AI/service
    job_analysis = extract_job_skills(
        data.description
    )

    job = Job(
        title=data.title,
        description=data.description,
        required_skills=", ".join(
            job_analysis["required_skills"]
        ),
        experience_requirement=
        job_analysis.get(
            "experience_requirement",
            "Not specified"
        ),
        education_requirement=
        job_analysis.get(
            "education_requirement",
            "Not specified"
        )
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    db.close()

    return {
        "message": "Job created successfully",
        "job_id": job.id,
        "job_details": {
            "title": job.title,
            "required_skills": job.required_skills
        }
    }

@app.get("/jobs")
def get_jobs():

    db = SessionLocal()

    jobs = db.query(Job).all()

    result = []

    for job in jobs:
        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "required_skills": job.required_skills,
            "experience_requirement": job.experience_requirement,
            "education_requirement": job.education_requirement
        })

    db.close()

    return result

@app.get("/jobs/{job_id}/rankings")
def job_candidate_rankings(job_id: int):

    db = SessionLocal()

    # Get selected job
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        db.close()
        return {
            "message": "Job not found"
        }


    # Convert job skills string to list
    required_skills = [
        skill.strip()
        for skill in job.required_skills.split(",")
    ]


    candidates = db.query(Candidate).all()

    rankings = []


    for candidate in candidates:


        candidate_skills = [
            skill.strip()
            for skill in candidate.skills.split(",")
        ]


        # Skill matching
        skill_result = calculate_skill_match(
            candidate_skills,
            required_skills
        )


        
        # Calculate real experience



        experience_data = []

        if candidate.experience:

            try:
                experience_data = ast.literal_eval(
                    candidate.experience
                )

            except:
                experience_data = []


        total_experience = calculate_total_experience(
            experience_data
        )


        experience_score = calculate_experience_score(
            total_experience
        )


        # Education score
        education_data = []

        if candidate.education:

            try:
                education_data = ast.literal_eval(
                    candidate.education
                )

            except:
                education_data = []


        degree = ""


        if education_data:

            degree = education_data[0].get(
                "Degree",
                ""
            )


        education_score = calculate_education_score(
            degree
        )
        


        # Overall score
        overall = calculate_overall_score(
            skill_result["skills_match"],
            experience_score,
            education_score
        )

        existing_ranking = db.query(
            CandidateRanking
        ).filter(
            CandidateRanking.candidate_id == candidate.id,
            CandidateRanking.job_id == job.id
        ).first()


        if existing_ranking:

            existing_ranking.overall_score = (
                overall["overall_score"]
            )

            existing_ranking.recommendation = (
                overall["recommendation"]
            )


        else:
            ranking_record = CandidateRanking(
                candidate_id=candidate.id,
                job_id=job.id,
                overall_score=overall["overall_score"],
                recommendation=overall["recommendation"]
            )

            db.add(ranking_record)


        db.commit()
         

        rankings.append({

            "candidate_id": candidate.id,

            "name": candidate.name,

            "skills_match":
            skill_result["skills_match"],

            "overall_score":
            overall["overall_score"],

            "recommendation":
            overall["recommendation"]

        })

    job_title = job.title
    db.close()


    rankings.sort(
        key=lambda x: x["overall_score"],
        reverse=True
    )


    return {
        "job": job_title,
        "rankings": rankings
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

@app.get("/dashboard/stats")
def dashboard_stats():

    db = SessionLocal()


    total_candidates = db.query(
        Candidate
    ).count()


    total_jobs = db.query(
        Job
    ).count()



    strong_candidates = db.query(
        CandidateRanking
    ).filter(
        CandidateRanking.overall_score >= 85
    ).count()



    good_candidates = db.query(
        CandidateRanking
    ).filter(
        CandidateRanking.overall_score >= 70,
        CandidateRanking.overall_score < 85
    ).count()



    average_candidates = db.query(
        CandidateRanking
    ).filter(
        CandidateRanking.overall_score >= 50,
        CandidateRanking.overall_score < 70
    ).count()



    db.close()


    return {

        "total_candidates": total_candidates,

        "total_jobs": total_jobs,

        "strong_candidates": strong_candidates,

        "good_candidates": good_candidates,

        "average_candidates": average_candidates

    }

@app.get("/jobs/{job_id}/top_candidates")
def top_candidates(job_id: int):

    db = SessionLocal()


    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )


    if not job:

        db.close()

        return {
            "message": "Job not found"
        }



    rankings = (
        db.query(CandidateRanking)
        .filter(
            CandidateRanking.job_id == job_id
        )
        .order_by(
            CandidateRanking.overall_score.desc()
        )
        .limit(5)
        .all()
    )


    result = []


    for ranking in rankings:


        candidate = (
            db.query(Candidate)
            .filter(
                Candidate.id == ranking.candidate_id
            )
            .first()
        )


        result.append({

            "candidate_id": candidate.id,

            "name": candidate.name,

            "email": candidate.email,

            "score": ranking.overall_score,

            "recommendation": ranking.recommendation

        })


    db.close()


    return {

        "job": job.title,

        "top_candidates": result

    }

@app.post("/applications")
def create_application(
    candidate_id: int,
    job_id: int
):

    db = SessionLocal()


    # Check candidate exists

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



    # Check job exists

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )


    if not job:

        db.close()

        return {
            "message": "Job not found"
        }



    # Check duplicate application

    existing = (
        db.query(Application)
        .filter(
            Application.candidate_id == candidate_id,
            Application.job_id == job_id
        )
        .first()
    )


    if existing:

        db.close()

        return {
            "message": "Candidate already applied",
            "application_id": existing.id
        }



    application = Application(
        candidate_id=candidate_id,
        job_id=job_id,
        status="Applied"
    )


    db.add(application)

    db.commit()

    db.refresh(application)

    db.close()


    return {

        "message": "Application created successfully",

        "application_id": application.id,

        "status": application.status

    }

@app.put("/applications/{application_id}")
def update_application_status(
    application_id: int,
    status: str
):

    db = SessionLocal()


    application = (
        db.query(Application)
        .filter(
            Application.id == application_id
        )
        .first()
    )


    if not application:

        db.close()

        return {
            "message": "Application not found"
        }


    application.status = status


    db.commit()

    db.refresh(application)

    db.close()


    return {

        "message": "Application status updated successfully",

        "application_id": application.id,

        "new_status": application.status

    }

@app.get("/applications")
def get_applications():

    db = SessionLocal()

    applications = db.query(Application).all()

    result = []


    for application in applications:

        candidate = (
            db.query(Candidate)
            .filter(
                Candidate.id == application.candidate_id
            )
            .first()
        )


        job = (
            db.query(Job)
            .filter(
                Job.id == application.job_id
            )
            .first()
        )


        result.append({

            "application_id": application.id,

            "candidate_name": candidate.name,

            "job_title": job.title,

            "status": application.status

        })


    db.close()


    return result

@app.get("/jobs/{job_id}/applications")
def get_job_applications(job_id: int):

    db = SessionLocal()


    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )


    if not job:

        db.close()

        return {
            "message": "Job not found"
        }


    applications = (
        db.query(Application)
        .filter(
            Application.job_id == job_id
        )
        .all()
    )


    result = []


    for application in applications:


        candidate = (
            db.query(Candidate)
            .filter(
                Candidate.id == application.candidate_id
            )
            .first()
        )


        result.append({

            "application_id": application.id,

            "candidate_id": candidate.id,

            "candidate_name": candidate.name,

            "email": candidate.email,

            "status": application.status

        })


    db.close()


    return {

        "job": job.title,

        "applications": result

    }

@app.post("/register")
def register_recruiter(
    data: RecruiterRequest
):

    db = SessionLocal()


    existing = (
        db.query(Recruiter)
        .filter(
            Recruiter.email == data.email
        )
        .first()
    )


    if existing:

        db.close()

        return {
            "message": "Recruiter already exists"
        }


    recruiter = Recruiter(
        name=data.name,
        email=data.email,
        password=hash_password(
            data.password
        )
    )


    db.add(recruiter)

    db.commit()

    db.refresh(recruiter)

    db.close()


    return {

        "message": "Recruiter registered successfully",

        "recruiter_id": recruiter.id

    }