from fastapi import APIRouter, Depends
import ast

from database import SessionLocal

from models import (
    Job,
    Candidate,
    CandidateRanking,
)

from schemas.job import JobRequest

from services.job_service import extract_job_skills

from services.scoring_service import (
    calculate_skill_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score,
    calculate_total_experience,
)

from security import get_current_user



router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.post("/")
def create_job(
    data: JobRequest,
    user=Depends(get_current_user)
):

    db = SessionLocal()

    job_analysis = extract_job_skills(
        data.description
    )

    job = Job(
        title=data.title,
        description=data.description,
        required_skills=", ".join(
            job_analysis["required_skills"]
        ),
        experience_requirement=job_analysis.get(
            "experience_requirement",
            "Not specified"
        ),
        education_requirement=job_analysis.get(
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


@router.get("/")
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

@router.get("/{job_id}/rankings")
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


@router.get("/{job_id}/top_candidates")
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

        # Skip if candidate doesn't exist
        if candidate is None:
            continue

        result.append({
            "candidate_id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "score": ranking.overall_score,
            "recommendation": ranking.recommendation
        })