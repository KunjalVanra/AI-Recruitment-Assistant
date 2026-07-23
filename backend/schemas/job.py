from pydantic import BaseModel


class JobRequest(BaseModel):
    title: str
    description: str