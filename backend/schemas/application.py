from pydantic import BaseModel


class ApplicationStatusUpdate(BaseModel):
    status: str