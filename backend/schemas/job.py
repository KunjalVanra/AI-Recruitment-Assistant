from pydantic import BaseModel
from typing import Optional


class JobRequest(BaseModel):
    title: str
    description: str
    required_skills: Optional[str] = None
    experience_requirement: Optional[str] = None
    education_requirement: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    experience_requirement: Optional[str] = None
    education_requirement: Optional[str] = None