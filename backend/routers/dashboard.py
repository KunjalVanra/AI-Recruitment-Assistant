from fastapi import APIRouter

router = APIRouter(
    tags=["Dashboard"]
)

@router.get("/dashboard/stats")
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