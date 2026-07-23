from fastapi import APIRouter, Query
from schemas.candidate import CandidateUpdate

from database import SessionLocal
from models import Candidate

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"]
)


@router.get("/")
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


@router.get("/{candidate_id}")
def get_candidate(candidate_id: int):

    db = SessionLocal()

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        db.close()
        return {"message": "Candidate not found"}

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


@router.put("/{candidate_id}")
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
        return {"message": "Candidate not found"}

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


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int):

    db = SessionLocal()

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        db.close()
        return {"message": "Candidate not found"}

    db.delete(candidate)
    db.commit()

    db.close()

    return {
        "message": "Candidate deleted successfully",
        "candidate_id": candidate_id
    }