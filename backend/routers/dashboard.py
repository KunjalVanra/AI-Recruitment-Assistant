from fastapi import APIRouter
from collections import Counter
from database import SessionLocal
from models import Candidate, Job, Application, CandidateRanking
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

        # Total applications
        total_applications = db.query(Application).count()

        # Total resumes uploaded
        total_resumes = (
            db.query(Candidate)
            .filter(Candidate.resume_file != None, Candidate.resume_file != "")
            .count()
        )
        if total_resumes == 0 and total_candidates > 0:
            total_resumes = total_candidates

        # Candidate rankings calculation
        rankings = get_rankings()

        strong_candidates = 0
        good_candidates = 0
        average_candidates = 0
        not_recommended_candidates = 0
        total_score_sum = 0

        for candidate in rankings:
            score = float(candidate.get("overall_score", 0))
            total_score_sum += score
            recommendation = candidate.get("recommendation", "")

            if recommendation == "Strong Candidate":
                strong_candidates += 1
            elif recommendation == "Good Candidate":
                good_candidates += 1
            elif recommendation == "Average Candidate":
                average_candidates += 1
            else:
                not_recommended_candidates += 1

        avg_score = round(total_score_sum / len(rankings), 1) if rankings else 0.0

        # Recent Candidates
        recent_cands_query = (
            db.query(Candidate)
            .order_by(Candidate.id.desc())
            .limit(5)
            .all()
        )
        recent_candidates = []
        all_skills = []

        all_cands = db.query(Candidate).all()
        for c in all_cands:
            if c.skills:
                for s in c.skills.split(","):
                    clean = s.strip()
                    if clean:
                        all_skills.append(clean)

        for c in recent_cands_query:
            recent_candidates.append({
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "skills": c.skills or "",
                "resume_file": c.resume_file or ""
            })

        # Recent Jobs
        recent_jobs_query = (
            db.query(Job)
            .order_by(Job.id.desc())
            .limit(5)
            .all()
        )
        recent_jobs = []
        for j in recent_jobs_query:
            app_count = db.query(Application).filter(Application.job_id == j.id).count()
            recent_jobs.append({
                "id": j.id,
                "title": j.title,
                "description": j.description,
                "required_skills": j.required_skills or "",
                "applicants_count": app_count
            })

        # Top skills distribution
        skill_counts = Counter(all_skills).most_common(8)
        skills_distribution = [
            {"skill": skill, "count": count}
            for skill, count in skill_counts
        ]

        # Application status distribution
        status_counts = Counter(
            app.status for app in db.query(Application).all() if app.status
        )
        status_distribution = [
            {"status": status, "count": count}
            for status, count in status_counts.items()
        ]

        return {
            "total_candidates": total_candidates,
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "total_resumes": total_resumes,
            "average_match_score": avg_score,
            "strong_candidates": strong_candidates,
            "good_candidates": good_candidates,
            "average_candidates": average_candidates,
            "not_recommended_candidates": not_recommended_candidates,
            "recent_candidates": recent_candidates,
            "recent_jobs": recent_jobs,
            "skills_distribution": skills_distribution,
            "status_distribution": status_distribution
        }
    finally:
        db.close()