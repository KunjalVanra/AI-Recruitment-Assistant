from fastapi import APIRouter
from database import SessionLocal
from models import Application, Candidate, Job, Recruiter

router = APIRouter(
    tags=["Applications"]
)


@router.post("/applications")
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

@router.put("/applications/{application_id}")
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

@router.get("/applications")
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

@router.get("/jobs/{job_id}/applications")
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
