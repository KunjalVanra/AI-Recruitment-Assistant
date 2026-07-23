from sqlalchemy import Column, Integer, String, Text, Float
from database import Base

status = Column(String, default="Pending")
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

class Job(Base):

    __tablename__ = "jobs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200)
    )

    description = Column(
        Text
    )

    required_skills = Column(
        String(500)
    )

    experience_requirement = Column(
        String(100)
    )

    education_requirement = Column(
        String(200)
    )

class CandidateRanking(Base):

    __tablename__ = "candidate_rankings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    candidate_id = Column(
        Integer,
        nullable=False
    )

    job_id = Column(
        Integer,
        nullable=False
    )

    overall_score = Column(
        Float
    )

    recommendation = Column(
        String(100)
    )

class Application(Base):

    __tablename__ = "applications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    candidate_id = Column(
        Integer,
        nullable=False
    )

    job_id = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String(50),
        default="Applied"
    )



class Recruiter(Base):

    __tablename__ = "recruiters"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100)
    )

    email = Column(
        String(100),
        unique=True
    )

    password = Column(
        String(255)
    )