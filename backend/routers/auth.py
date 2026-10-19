from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from database import SessionLocal
from models import Recruiter
from auth import hash_password, verify_password
from security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================
# Request Models
# =========================

class RecruiterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# Register
# =========================

@router.post("/register")
def register_recruiter(data: RecruiterRequest):

    db = SessionLocal()

    try:

        existing = (
            db.query(Recruiter)
            .filter(Recruiter.email == data.email)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email is already registered"
            )

        recruiter = Recruiter(
            name=data.name,
            email=data.email,
            password=hash_password(data.password)
        )

        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)

        return {
            "message": "Recruiter registered successfully",
            "recruiter_id": recruiter.id
        }

    finally:
        db.close()


# =========================
# Login
# =========================

@router.post("/login")
def login(data: LoginRequest):

    db = SessionLocal()

    try:

        recruiter = (
            db.query(Recruiter)
            .filter(Recruiter.email == data.email)
            .first()
        )

        if not recruiter:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not verify_password(
            data.password,
            recruiter.password
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = create_access_token(
            {
                "sub": recruiter.email,
                "id": recruiter.id,
                "name": recruiter.name
            }
        )

        return {
            "message": "Login successful",
            "access_token": token,
            "token_type": "bearer",
            "recruiter": {
                "id": recruiter.id,
                "name": recruiter.name,
                "email": recruiter.email
            }
        }

    finally:
        db.close()