from pydantic import BaseModel


class CandidateUpdate(BaseModel):
    phone: str | None = None
    skills: str | None = None
    education: str | None = None
    experience: str | None = None