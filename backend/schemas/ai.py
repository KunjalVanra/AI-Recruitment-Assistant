from pydantic import BaseModel


class ScoreRequest(BaseModel):
    candidate_skills: list[str]
    required_skills: list[str]


class RankRequest(BaseModel):
    candidate_skills: list[str]
    required_skills: list[str]
    experience_years: int
    degree: str


class MatchRequest(BaseModel):
    candidate_skills: list[str]
    job_description: str


class EvaluateRequest(BaseModel):
    candidate_id: int
    job_id: int