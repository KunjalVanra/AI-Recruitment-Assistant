from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class CandidateJobRequest(BaseModel):
    candidate_id: int
    job_id: int


class EvaluateRequest(BaseModel):
    candidate_id: int
    job_id: int


class ChatRequest(BaseModel):
    message: str
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None
    history: Optional[List[Dict[str, str]]] = []