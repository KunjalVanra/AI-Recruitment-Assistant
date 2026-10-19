from fastapi import APIRouter, UploadFile, File, HTTPException

import os
import shutil
import json
import ast

from database import SessionLocal
from models import Candidate, Job, CandidateRanking

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
    CandidateJobRequest,
    EvaluateRequest,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Services"]
)


UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_candidate_and_job(candidate_id: int, job_id: int):

    db = SessionLocal()

    try:

        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not candidate:
            raise HTTPException(
                status_code=404,
                detail=f"Candidate with ID {candidate_id} not found"
            )

        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail=f"Job with ID {job_id} not found"
            )

        return db, candidate, job

    except Exception:
        db.close()
        raise


def get_candidate_skills(candidate):

    if not candidate.skills:
        return []

    return [
        skill.strip()
        for skill in candidate.skills.split(",")
        if skill.strip()
    ]


def get_required_skills(job):

    if not job.required_skills:
        return []

    return [
        skill.strip()
        for skill in job.required_skills.split(",")
        if skill.strip()
    ]


def get_experience_years(candidate):

    if not candidate.experience:
        return 0

    try:

        experience_data = json.loads(candidate.experience)

    except Exception:

        try:
            experience_data = ast.literal_eval(
                candidate.experience
            )
        except Exception:
            return 0

    if not isinstance(experience_data, list):
        return 0

    total_years = 0

    for experience in experience_data:

        if not isinstance(experience, dict):
            continue

        # Support different possible AI key formats
        years = (
            experience.get("Years")
            or experience.get("years")
            or experience.get("Duration")
            or experience.get("duration")
        )

        if years is None:
            continue

        try:

            # Example: "2 years"
            if isinstance(years, str):

                import re

                match = re.search(
                    r"\d+(\.\d+)?",
                    years
                )

                if match:
                    total_years += float(
                        match.group()
                    )

            else:

                total_years += float(years)

        except Exception:
            continue

    return total_years


def get_degree(candidate):

    if not candidate.education:
        return ""

    try:

        education_data = json.loads(
            candidate.education
        )

    except Exception:

        try:
            education_data = ast.literal_eval(
                candidate.education
            )
        except Exception:
            return ""

    if not isinstance(education_data, list):
        return ""

    if not education_data:
        return ""

    first_education = education_data[0]

    if not isinstance(first_education, dict):
        return ""

    return (
        first_education.get("Degree")
        or first_education.get("degree")
        or first_education.get("Qualification")
        or first_education.get("qualification")
        or ""
    )


def calculate_candidate_result(candidate, job):

    candidate_skills = get_candidate_skills(
        candidate
    )

    required_skills = get_required_skills(
        job
    )

    # ---------------------------------------------
    # Skill Matching
    # ---------------------------------------------

    skill_result = calculate_skill_match(
        candidate_skills,
        required_skills
    )

    # ---------------------------------------------
    # Experience
    # ---------------------------------------------

    experience_years = get_experience_years(
        candidate
    )

    experience_score = calculate_experience_score(
        experience_years
    )

    # ---------------------------------------------
    # Education
    # ---------------------------------------------

    degree = get_degree(candidate)

    education_score = calculate_education_score(
        degree
    )

    # ---------------------------------------------
    # Overall Score
    # ---------------------------------------------

    overall_result = calculate_overall_score(
        skill_result["skills_match"],
        experience_score,
        education_score
    )

    return {
        "candidate_id": candidate.id,
        "candidate_name": candidate.name,
        "job_id": job.id,
        "job_title": job.title,

        "skills_match": skill_result[
            "skills_match"
        ],

        "matched_skills": skill_result[
            "matched_skills"
        ],

        "missing_skills": skill_result[
            "missing_skills"
        ],

        "experience_years": experience_years,

        "experience_score": experience_score,

        "education": degree,

        "education_score": education_score,

        "overall_score": overall_result[
            "overall_score"
        ],

        "recommendation": overall_result[
            "recommendation"
        ]
    }


# =========================================================
# UPLOAD RESUME
# =========================================================

@router.post("/upload_resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # ---------------------------------------------
    # Extract PDF text
    # ---------------------------------------------

    extracted_text = extract_text_from_pdf(
        file_path
    )

    print(
        "\n========== EXTRACTED RESUME TEXT =========="
    )

    print(extracted_text)

    print(
        "============================================\n"
    )

    # ---------------------------------------------
    # AI Resume Analysis
    # ---------------------------------------------

    analysis = analyze_resume(
        extracted_text
    )

    print(
        "\n========== GROQ RAW RESPONSE =========="
    )

    print(analysis)

    print(
        "=======================================\n"
    )

    # ---------------------------------------------
    # Convert AI response to JSON
    # ---------------------------------------------

    if isinstance(analysis, str):

        clean_analysis = (
            analysis
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:

            analysis = json.loads(
                clean_analysis
            )

        except json.JSONDecodeError:

            return {
                "message": "AI returned invalid JSON",
                "raw_response": analysis
            }

    if not isinstance(analysis, dict):

        return {
            "message": "Invalid AI response format"
        }

    # ---------------------------------------------
    # Extract Candidate Information
    # ---------------------------------------------

    name = analysis.get(
        "Name",
        ""
    )

    email = analysis.get(
        "Email",
        ""
    )

    phone = analysis.get(
        "Phone",
        ""
    )

    skills = analysis.get(
        "Skills",
        []
    )

    education = analysis.get(
        "Education",
        []
    )

    experience = analysis.get(
        "Experience",
        []
    )

    # ---------------------------------------------
    # Normalize Skills
    # ---------------------------------------------

    if isinstance(skills, str):

        skills = [
            skill.strip()
            for skill in skills.split(",")
            if skill.strip()
        ]

    elif not isinstance(skills, list):

        skills = []

    skills_string = ", ".join(
        str(skill).strip()
        for skill in skills
        if str(skill).strip()
    )

    # ---------------------------------------------
    # Save Candidate
    # ---------------------------------------------

    db = SessionLocal()

    try:

        existing_candidate = (
            db.query(Candidate)
            .filter(
                Candidate.email == email
            )
            .first()
        )

        if existing_candidate:

            return {
                "message": "Candidate already exists",
                "candidate_id": existing_candidate.id,
                "candidate_name": existing_candidate.name,
                "skills": existing_candidate.skills
            }

        candidate = Candidate(
            name=name,
            email=email,
            phone=phone,
            skills=skills_string,
            education=json.dumps(
                education
            ),
            experience=json.dumps(
                experience
            ),
            resume_file=file.filename
        )

        db.add(candidate)

        db.commit()

        db.refresh(candidate)

        return {
            "message": "Resume uploaded successfully",
            "candidate_id": candidate.id,
            "candidate_name": candidate.name,

            "resume_analysis": {
                "Name": name,
                "Email": email,
                "Phone": phone,
                "Skills": skills,
                "Education": education,
                "Experience": experience
            }
        }

    finally:

        db.close()


# =========================================================
# MATCH CANDIDATE
# =========================================================

@router.post("/match_candidate")
def match_candidate(
    data: CandidateJobRequest
):

    db, candidate, job = get_candidate_and_job(
        data.candidate_id,
        data.job_id
    )

    try:

        candidate_skills = get_candidate_skills(
            candidate
        )

        required_skills = get_required_skills(
            job
        )

        skill_result = calculate_skill_match(
            candidate_skills,
            required_skills
        )

        return {
            "candidate_id": candidate.id,
            "candidate_name": candidate.name,

            "job_id": job.id,
            "job_title": job.title,

            "skills_match": skill_result[
                "skills_match"
            ],

            "matched_skills": skill_result[
                "matched_skills"
            ],

            "missing_skills": skill_result[
                "missing_skills"
            ]
        }

    finally:

        db.close()


# =========================================================
# SCORE CANDIDATE
# =========================================================

@router.post("/score_candidate")
def score_candidate(
    data: CandidateJobRequest
):

    db, candidate, job = get_candidate_and_job(
        data.candidate_id,
        data.job_id
    )

    try:

        result = calculate_candidate_result(
            candidate,
            job
        )

        return result

    finally:

        db.close()


# =========================================================
# RANK CANDIDATE
# =========================================================

@router.post("/rank_candidate")
def rank_candidate(
    data: CandidateJobRequest
):

    db, candidate, job = get_candidate_and_job(
        data.candidate_id,
        data.job_id
    )

    try:

        # -----------------------------------------
        # Calculate selected candidate score
        # -----------------------------------------

        selected_result = (
            calculate_candidate_result(
                candidate,
                job
            )
        )

        # -----------------------------------------
        # Calculate all candidate scores
        # -----------------------------------------

        candidates = (
            db.query(Candidate)
            .all()
        )

        all_results = []

        for current_candidate in candidates:

            result = calculate_candidate_result(
                current_candidate,
                job
            )

            all_results.append(result)

        # -----------------------------------------
        # Sort highest score first
        # -----------------------------------------

        all_results.sort(
            key=lambda x: x["overall_score"],
            reverse=True
        )

        # -----------------------------------------
        # Find selected candidate rank
        # -----------------------------------------

        candidate_rank = None

        for index, result in enumerate(
            all_results,
            start=1
        ):

            if result["candidate_id"] == candidate.id:

                candidate_rank = index

                break

        # -----------------------------------------
        # Save ranking
        # -----------------------------------------

        existing = (
            db.query(CandidateRanking)
            .filter(
                CandidateRanking.candidate_id
                == candidate.id,

                CandidateRanking.job_id
                == job.id
            )
            .first()
        )

        if existing:

            existing.overall_score = (
                selected_result[
                    "overall_score"
                ]
            )

            existing.recommendation = (
                selected_result[
                    "recommendation"
                ]
            )

        else:

            ranking = CandidateRanking(
                candidate_id=candidate.id,
                job_id=job.id,
                overall_score=(
                    selected_result[
                        "overall_score"
                    ]
                ),
                recommendation=(
                    selected_result[
                        "recommendation"
                    ]
                )
            )

            db.add(ranking)

        db.commit()

        return {
            "candidate_id": candidate.id,
            "candidate_name": candidate.name,

            "job_id": job.id,
            "job_title": job.title,

            "rank": candidate_rank,

            "total_candidates": len(
                all_results
            ),

            "skills_match": selected_result[
                "skills_match"
            ],

            "experience_score": selected_result[
                "experience_score"
            ],

            "education_score": selected_result[
                "education_score"
            ],

            "overall_score": selected_result[
                "overall_score"
            ],

            "recommendation": selected_result[
                "recommendation"
            ]
        }

    finally:

        db.close()


# =========================================================
# EVALUATE CANDIDATE
# =========================================================

@router.post("/evaluate_candidate")
def evaluate_candidate(
    data: EvaluateRequest
):

    db, candidate, job = get_candidate_and_job(
        data.candidate_id,
        data.job_id
    )

    try:

        result = calculate_candidate_result(
            candidate,
            job
        )

        return {
            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "skills": get_candidate_skills(
                    candidate
                ),
                "experience_years": result[
                    "experience_years"
                ],
                "education": result[
                    "education"
                ]
            },

            "job": {
                "id": job.id,
                "title": job.title
            },

            "evaluation": {
                "skills_match": result[
                    "skills_match"
                ],

                "matched_skills": result[
                    "matched_skills"
                ],

                "missing_skills": result[
                    "missing_skills"
                ],

                "experience_score": result[
                    "experience_score"
                ],

                "education_score": result[
                    "education_score"
                ],

                "overall_score": result[
                    "overall_score"
                ],

                "recommendation": result[
                    "recommendation"
                ]
            }
        }

    finally:

        db.close()


# =========================================================
# GET ALL RANKINGS
# =========================================================

@router.get("/rankings")
def get_rankings():

    db = SessionLocal()

    try:

        candidates = (
            db.query(Candidate)
            .all()
        )

        rankings = []

        # Current default job requirement
        # kept for compatibility with your
        # existing endpoint.

        required_skills = [
            "Python",
            "FastAPI",
            "SQL",
            "AWS"
        ]

        for candidate in candidates:

            candidate_skills = (
                get_candidate_skills(
                    candidate
                )
            )

            skill_result = (
                calculate_skill_match(
                    candidate_skills,
                    required_skills
                )
            )

            experience_years = (
                get_experience_years(
                    candidate
                )
            )

            experience_score = (
                calculate_experience_score(
                    experience_years
                )
            )

            degree = get_degree(
                candidate
            )

            education_score = (
                calculate_education_score(
                    degree
                )
            )

            overall = (
                calculate_overall_score(
                    skill_result[
                        "skills_match"
                    ],
                    experience_score,
                    education_score
                )
            )

            rankings.append({
                "candidate_id": candidate.id,
                "candidate_name": candidate.name,
                "overall_score": overall[
                    "overall_score"
                ],
                "recommendation": overall[
                    "recommendation"
                ]
            })

        rankings.sort(
            key=lambda x: x[
                "overall_score"
            ],
            reverse=True
        )

        return rankings

    finally:

        db.close()