from fastapi import APIRouter, HTTPException
import ast
import json

from database import SessionLocal
from models import (
    Job,
    Candidate,
    CandidateRanking,
    Application,
)
from schemas.job import JobRequest, JobUpdate
from services.job_service import extract_job_skills
from services.scoring_service import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score,
    calculate_total_experience,
)

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


# ============================================================
# CREATE JOB
# ============================================================

@router.post("", include_in_schema=False)
@router.post("/")
def create_job(data: JobRequest):
    db = SessionLocal()
    try:
        req_skills_str = data.required_skills
        exp_req = data.experience_requirement
        edu_req = data.education_requirement

        # If required skills were not provided explicitly, extract using AI
        if not req_skills_str:
            try:
                job_analysis = extract_job_skills(data.description)
                req_skills_str = ", ".join(job_analysis.get("required_skills", []))
                if not exp_req:
                    exp_req = job_analysis.get("experience_requirement", "Not specified")
                if not edu_req:
                    edu_req = job_analysis.get("education_requirement", "Not specified")
            except Exception as e:
                print(f"Warning: AI job skill extraction failed: {e}")
                req_skills_str = req_skills_str or ""
                exp_req = exp_req or "Not specified"
                edu_req = edu_req or "Not specified"

        job = Job(
            title=data.title,
            description=data.description,
            required_skills=req_skills_str or "Not specified",
            experience_requirement=exp_req or "Not specified",
            education_requirement=edu_req or "Not specified"
        )

        db.add(job)
        db.commit()
        db.refresh(job)

        return {
            "message": "Job created successfully",
            "job_id": job.id,
            "job_details": {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "required_skills": job.required_skills,
                "experience_requirement": job.experience_requirement,
                "education_requirement": job.education_requirement
            }
        }
    finally:
        db.close()


# ============================================================
# GET ALL JOBS
# ============================================================

@router.get("", include_in_schema=False)
@router.get("/")
def get_jobs():
    db = SessionLocal()
    try:
        jobs = db.query(Job).order_by(Job.id.desc()).all()
        result = []
        for job in jobs:
            result.append({
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "required_skills": job.required_skills or "",
                "experience_requirement": job.experience_requirement or "Not specified",
                "education_requirement": job.education_requirement or "Not specified"
            })
        return result
    finally:
        db.close()


# ============================================================
# GET SINGLE JOB DETAILS
# ============================================================

@router.get("/{job_id}")
def get_job(job_id: int):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Also count associated applicants
        applicants_count = db.query(Application).filter(Application.job_id == job_id).count()

        return {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "required_skills": job.required_skills or "",
            "experience_requirement": job.experience_requirement or "Not specified",
            "education_requirement": job.education_requirement or "Not specified",
            "applicants_count": applicants_count
        }
    finally:
        db.close()


# ============================================================
# UPDATE / EDIT JOB
# ============================================================

@router.put("/{job_id}")
def update_job(job_id: int, data: JobUpdate):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        if data.title is not None:
            job.title = data.title

        if data.description is not None:
            job.description = data.description

        if data.required_skills is not None:
            job.required_skills = data.required_skills

        if data.experience_requirement is not None:
            job.experience_requirement = data.experience_requirement

        if data.education_requirement is not None:
            job.education_requirement = data.education_requirement

        db.commit()
        db.refresh(job)

        return {
            "message": "Job updated successfully",
            "job_id": job.id,
            "job": {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "required_skills": job.required_skills,
                "experience_requirement": job.experience_requirement,
                "education_requirement": job.education_requirement
            }
        }
    finally:
        db.close()


# ============================================================
# DELETE JOB (Safely cleans associated applications and rankings)
# ============================================================

@router.delete("/{job_id}")
def delete_job(job_id: int):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Safely delete associated applications
        db.query(Application).filter(Application.job_id == job_id).delete(synchronize_session=False)

        # Safely delete associated candidate rankings
        db.query(CandidateRanking).filter(CandidateRanking.job_id == job_id).delete(synchronize_session=False)

        # Delete job
        db.delete(job)
        db.commit()

        return {
            "message": "Job deleted successfully",
            "job_id": job_id
        }
    finally:
        db.close()


# ============================================================
# GET CANDIDATE RANKINGS FOR A JOB
# ============================================================

@router.get("/{job_id}/rankings")
def job_candidate_rankings(job_id: int):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"message": "Job not found", "job": None, "rankings": []}

        required_skills = [
            skill.strip()
            for skill in (job.required_skills or "").split(",")
            if skill.strip()
        ]

        candidates = db.query(Candidate).all()
        rankings = []

        for candidate in candidates:
            # Candidate skills
            candidate_skills = []
            if candidate.skills:
                candidate_skills = [
                    skill.strip()
                    for skill in candidate.skills.split(",")
                    if skill.strip()
                ]

            skill_result = calculate_skill_match(
                candidate_skills,
                required_skills
            )

            # Experience
            experience_data = []
            if candidate.experience:
                try:
                    experience_data = json.loads(candidate.experience)
                except Exception:
                    try:
                        experience_data = ast.literal_eval(candidate.experience)
                    except Exception:
                        experience_data = []

            total_experience = calculate_total_experience(experience_data)
            experience_score = calculate_experience_score(total_experience)

            # Education
            education_data = []
            if candidate.education:
                try:
                    education_data = json.loads(candidate.education)
                except Exception:
                    try:
                        education_data = ast.literal_eval(candidate.education)
                    except Exception:
                        education_data = []

            degree = ""
            if education_data and isinstance(education_data, list) and isinstance(education_data[0], dict):
                degree = (
                    education_data[0].get("Degree")
                    or education_data[0].get("degree")
                    or education_data[0].get("Qualification")
                    or ""
                )

            education_score = calculate_education_score(degree)

            overall = calculate_overall_score(
                skill_result["skills_match"],
                experience_score,
                education_score
            )

            # Persist ranking in DB
            existing_ranking = (
                db.query(CandidateRanking)
                .filter(
                    CandidateRanking.candidate_id == candidate.id,
                    CandidateRanking.job_id == job.id
                )
                .first()
            )

            if existing_ranking:
                existing_ranking.overall_score = overall["overall_score"]
                existing_ranking.recommendation = overall["recommendation"]
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
                "email": candidate.email,
                "skills_match": skill_result["skills_match"],
                "matched_skills": skill_result.get("matched_skills", []),
                "missing_skills": skill_result.get("missing_skills", []),
                "experience_years": total_experience,
                "experience_score": experience_score,
                "education_score": education_score,
                "overall_score": overall["overall_score"],
                "recommendation": overall["recommendation"]
            })

        rankings.sort(
            key=lambda x: x["overall_score"],
            reverse=True
        )

        return {
            "job": job.title,
            "job_id": job.id,
            "required_skills": job.required_skills,
            "rankings": rankings
        }
    finally:
        db.close()


# ============================================================
# GET TOP 5 CANDIDATES
# ============================================================

@router.get("/{job_id}/top_candidates")
def top_candidates(job_id: int):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"message": "Job not found"}

        rankings = (
            db.query(CandidateRanking)
            .filter(CandidateRanking.job_id == job_id)
            .order_by(CandidateRanking.overall_score.desc())
            .limit(5)
            .all()
        )

        result = []
        for ranking in rankings:
            candidate = (
                db.query(Candidate)
                .filter(Candidate.id == ranking.candidate_id)
                .first()
            )
            if candidate is None:
                continue

            result.append({
                "candidate_id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "score": ranking.overall_score,
                "recommendation": ranking.recommendation
            })

        return result
    finally:
        db.close()