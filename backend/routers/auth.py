from fastapi import APIRouter
from pydantic import BaseModel

from database import SessionLocal
from models import Recruiter
from auth import hash_password, verify_password
from security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class RecruiterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register_recruiter(data: RecruiterRequest):

    db = SessionLocal()

    existing = (
        db.query(Recruiter)
        .filter(Recruiter.email == data.email)
        .first()
    )

    if existing:
        db.close()
        return {"message": "Recruiter already exists"}

    recruiter = Recruiter(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)
    )

    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    db.close()

    return {
        "message": "Recruiter registered successfully",
        "recruiter_id": recruiter.id
    }


@router.post("/login")
def login(data: LoginRequest):

    db = SessionLocal()

    recruiter = (
        db.query(Recruiter)
        .filter(Recruiter.email == data.email)
        .first()
    )

    if not recruiter:
        db.close()
        return {"message": "Invalid email or password"}

    if not verify_password(
        data.password,
        recruiter.password
    ):
        db.close()
        return {"message": "Invalid email or password"}

    db.close()

    token = create_access_token(
    {
        "sub": recruiter.email,
        "id": recruiter.id
    }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }