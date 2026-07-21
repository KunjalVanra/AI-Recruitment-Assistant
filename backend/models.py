from sqlalchemy import Column, Integer, String, Text
from database import Base


class Candidate(Base):

    __tablename__ = "candidates"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(String(100))

    email = Column(String(100))

    phone = Column(String(20))

    skills = Column(Text)

    education = Column(Text)

    experience = Column(Text)

    resume_file = Column(String(200))