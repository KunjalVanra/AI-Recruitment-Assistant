from fastapi import APIRouter
from database import SessionLocal
from models import Candidate, Job
from routers.ai import get_rankings

router = APIRouter(
    tags=["Dashboard"]
)


@router.get("/dashboard/stats")
def dashboard_stats():

    db = SessionLocal()

    try:
        # Total candidates
        total_candidates = db.query(Candidate).count()

        # Total jobs
        total_jobs = db.query(Job).count()

        # Get EXACT SAME ranking data used by Rankings.jsx
        rankings = get_rankings()

        strong_candidates = 0
        good_candidates = 0
        average_candidates = 0
        not_recommended_candidates = 0

        # Count candidates from the SAME ranking results
        for candidate in rankings:

            recommendation = candidate["recommendation"]

            if recommendation == "Strong Candidate":
                strong_candidates += 1

            elif recommendation == "Good Candidate":
                good_candidates += 1

            elif recommendation == "Average Candidate":
                average_candidates += 1

            else:
                not_recommended_candidates += 1

        return {
            "total_candidates": total_candidates,
            "total_jobs": total_jobs,
            "strong_candidates": strong_candidates,
            "good_candidates": good_candidates,
            "average_candidates": average_candidates,
            "not_recommended_candidates": not_recommended_candidates
        }

    finally:
        db.close()