from fastapi import APIRouter, HTTPException, Query
from database import SessionLocal
from models import Application, Candidate, Job, Recruiter, CandidateRanking

router = APIRouter(
    tags=["Applications"]
)


@router.post("/applications")
def create_application(
    candidate_id: int,
    job_id: int
):
    db = SessionLocal()
    try:
        # Check candidate exists
        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )
        if not candidate:
            return {"message": "Candidate not found"}

        # Check job exists
        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )
        if not job:
            return {"message": "Job not found"}

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
            return {
                "message": "Candidate already applied",
                "application_id": existing.id,
                "status": existing.status
            }

        application = Application(
            candidate_id=candidate_id,
            job_id=job_id,
            status="Applied"
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        return {
            "message": "Application created successfully",
            "application_id": application.id,
            "status": application.status
        }
    finally:
        db.close()


@router.put("/applications/{application_id}")
def update_application_status(
    application_id: int,
    status: str
):
    db = SessionLocal()
    try:
        application = (
            db.query(Application)
            .filter(Application.id == application_id)
            .first()
        )
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        application.status = status
        db.commit()
        db.refresh(application)

        return {
            "message": "Application status updated successfully",
            "application_id": application.id,
            "new_status": application.status
        }
    finally:
        db.close()


@router.delete("/applications/{application_id}")
def delete_application(application_id: int):
    db = SessionLocal()
    try:
        application = (
            db.query(Application)
            .filter(Application.id == application_id)
            .first()
        )
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        db.delete(application)
        db.commit()

        return {
            "message": "Application withdrawn successfully",
            "application_id": application_id
        }
    finally:
        db.close()


@router.get("/applications")
def get_applications(
    job_id: int = Query(None),
    status: str = Query(None)
):
    db = SessionLocal()
    try:
        query = db.query(Application)

        if job_id:
            query = query.filter(Application.job_id == job_id)

        if status:
            query = query.filter(Application.status.ilike(f"%{status}%"))

        applications = query.order_by(Application.id.desc()).all()
        result = []

        for application in applications:
            candidate = (
                db.query(Candidate)
                .filter(Candidate.id == application.candidate_id)
                .first()
            )
            job = (
                db.query(Job)
                .filter(Job.id == application.job_id)
                .first()
            )

            # Skip invalid application records
            if candidate is None or job is None:
                continue

            # Lookup ranking score if exists
            ranking = (
                db.query(CandidateRanking)
                .filter(
                    CandidateRanking.candidate_id == candidate.id,
                    CandidateRanking.job_id == job.id
                )
                .first()
            )

            result.append({
                "application_id": application.id,
                "candidate_id": candidate.id,
                "candidate_name": candidate.name,
                "candidate_email": candidate.email,
                "candidate_skills": candidate.skills,
                "job_id": job.id,
                "job_title": job.title,
                "status": application.status,
                "overall_score": ranking.overall_score if ranking else None,
                "recommendation": ranking.recommendation if ranking else None
            })

        return result
    finally:
        db.close()


@router.get("/jobs/{job_id}/applications")
def get_job_applications(job_id: int):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        applications = (
            db.query(Application)
            .filter(Application.job_id == job_id)
            .order_by(Application.id.desc())
            .all()
        )

        result = []
        for application in applications:
            candidate = (
                db.query(Candidate)
                .filter(Candidate.id == application.candidate_id)
                .first()
            )
            if candidate is None:
                continue

            ranking = (
                db.query(CandidateRanking)
                .filter(
                    CandidateRanking.candidate_id == candidate.id,
                    CandidateRanking.job_id == job.id
                )
                .first()
            )

            result.append({
                "application_id": application.id,
                "candidate_id": candidate.id,
                "candidate_name": candidate.name,
                "email": candidate.email,
                "skills": candidate.skills,
                "status": application.status,
                "overall_score": ranking.overall_score if ranking else None,
                "recommendation": ranking.recommendation if ranking else None
            })

        return {
            "job": job.title,
            "job_id": job.id,
            "applications": result
        }
    finally:
        db.close()