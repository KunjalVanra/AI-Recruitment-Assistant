from fastapi import APIRouter, Query, HTTPException
from schemas.candidate import CandidateUpdate

from database import SessionLocal
from models import Application, Candidate, Job, CandidateRanking

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"]
)


@router.get("", include_in_schema=False)
@router.get("/")
def get_candidates(
    skill: str = Query(None),
    name: str = Query(None),
    email: str = Query(None),
    experience: str = Query(None)
):
    db = SessionLocal()
    try:
        query = db.query(Candidate)

        if skill:
            query = query.filter(Candidate.skills.ilike(f"%{skill}%"))

        if name:
            query = query.filter(Candidate.name.ilike(f"%{name}%"))

        if email:
            query = query.filter(Candidate.email.ilike(f"%{email}%"))

        if experience:
            query = query.filter(Candidate.experience.ilike(f"%{experience}%"))

        candidates = query.order_by(Candidate.id.desc()).all()

        result = []
        for candidate in candidates:
            # Also count applications
            app_count = db.query(Application).filter(Application.candidate_id == candidate.id).count()

            result.append({
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "phone": candidate.phone,
                "skills": candidate.skills,
                "education": candidate.education,
                "experience": candidate.experience,
                "resume_file": candidate.resume_file,
                "applications_count": app_count
            })

        return result
    finally:
        db.close()


@router.get("/{candidate_id}")
def get_candidate(candidate_id: int):
    db = SessionLocal()
    try:
        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Fetch applications history
        applications = (
            db.query(Application)
            .filter(Application.candidate_id == candidate_id)
            .all()
        )
        app_history = []
        for app in applications:
            job = db.query(Job).filter(Job.id == app.job_id).first()
            app_history.append({
                "application_id": app.id,
                "job_id": app.job_id,
                "job_title": job.title if job else f"Job #{app.job_id}",
                "status": app.status
            })

        # Fetch latest rankings
        rankings = (
            db.query(CandidateRanking)
            .filter(CandidateRanking.candidate_id == candidate_id)
            .all()
        )
        rankings_data = []
        for r in rankings:
            job = db.query(Job).filter(Job.id == r.job_id).first()
            rankings_data.append({
                "job_id": r.job_id,
                "job_title": job.title if job else f"Job #{r.job_id}",
                "overall_score": r.overall_score,
                "recommendation": r.recommendation
            })

        result = {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "skills": candidate.skills,
            "education": candidate.education,
            "experience": candidate.experience,
            "resume_file": candidate.resume_file,
            "applications": app_history,
            "rankings": rankings_data
        }

        return result
    finally:
        db.close()


@router.put("/{candidate_id}")
def update_candidate(
    candidate_id: int,
    data: CandidateUpdate
):
    db = SessionLocal()
    try:
        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        if data.name:
            candidate.name = data.name

        if data.email:
            candidate.email = data.email

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

        return {
            "message": "Candidate updated successfully",
            "candidate_id": candidate_id,
            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "phone": candidate.phone,
                "skills": candidate.skills
            }
        }
    finally:
        db.close()


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int):
    db = SessionLocal()
    try:
        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Safely remove associated applications and rankings first
        db.query(Application).filter(Application.candidate_id == candidate_id).delete(synchronize_session=False)
        db.query(CandidateRanking).filter(CandidateRanking.candidate_id == candidate_id).delete(synchronize_session=False)

        db.delete(candidate)
        db.commit()

        return {
            "message": "Candidate deleted successfully",
            "candidate_id": candidate_id
        }
    finally:
        db.close()