from pydantic import BaseModel


class CandidateJobRequest(BaseModel):
    candidate_id: int
    job_id: int


class EvaluateRequest(BaseModel):
    candidate_id: int
    job_id: int