# AI Recruitment Assistant

An **AI-powered Recruitment Management System** that automates resume screening, candidate evaluation, skill matching, and candidate ranking using Artificial Intelligence.

The system helps recruiters reduce manual screening time by automatically analyzing resumes, extracting candidate information, comparing it with job requirements, and recommending the best candidates.

---

# Project Overview

The AI Recruitment Assistant provides an end-to-end recruitment solution.

### Key Features

- Upload PDF resumes
- AI-based Resume Parsing
- Automatic Candidate Information Extraction
- Candidate Management (CRUD)
- Job Management
- Skill Matching
- Candidate Evaluation
- Candidate Scoring
- AI Candidate Ranking
- Application Management
- Recruiter Authentication
- Dashboard Analytics
- REST API Documentation (Swagger)
- React Frontend Dashboard

---

# Tech Stack

## Frontend

- React.js
- React Router DOM
- Axios
- CSS

## Backend

- Python
- FastAPI
- SQLAlchemy
- MySQL
- Pydantic
- Uvicorn

## AI

- Groq AI API
- Resume Parsing
- Skill Extraction
- Candidate Ranking
- Resume Analysis

## Tools

- Git
- GitHub
- Swagger UI
- VS Code

---

# Project Structure

```
AI-Recruitment-Assistant/

│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── security.py
│   ├── requirements.txt
│   ├── routers/
│   │      ├── ai.py
│   │      ├── jobs.py
│   │      ├── candidates.py
│   │      ├── applications.py
│   │      ├── dashboard.py
│   │      └── auth.py
│   │
│   ├── services/
│   │      ├── parser.py
│   │      ├── groq_service.py
│   │      ├── job_service.py
│   │      └── scoring_service.py
│   │
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │      ├── components/
│   │      ├── pages/
│   │      ├── services/
│   │      └── App.jsx
│   │
│   └── package.json
│
└── README.md
```

---

# Features Implemented

## 1. AI Resume Upload

- Upload PDF resumes
- Extract text from PDF
- Analyze resume using Groq AI
- Convert AI output into structured JSON
- Store candidate information in database

---

## 2. Candidate Management

Implemented complete CRUD operations.

- Add Candidate
- View Candidates
- Search Candidates
- Update Candidate
- Delete Candidate

Supported Filters

```
GET /candidates?skill=Python

GET /candidates?name=KUNJAL

GET /candidates?experience=2
```

---

## 3. Duplicate Resume Detection

- Prevent duplicate candidates
- Email-based duplicate validation

---

## 4. Job Management

Recruiters can

- Create Jobs
- View Jobs
- Store Required Skills
- Store Experience Requirement
- Store Education Requirement

---

## 5. AI Candidate Evaluation

The system automatically

- Reads candidate skills
- Reads job requirements
- Matches skills
- Calculates experience score
- Calculates education score
- Generates recommendation

Example Output

```
Candidate : KUNJAL VANRA

Matched Skills

Python
SQL

Missing Skills

AWS
FastAPI

Overall Score

53.5

Recommendation

Average Candidate
```

---

## 6. Skill Matching

Compare candidate skills with job requirements.

Returns

- Required Skills
- Matched Skills
- Missing Skills
- Skill Match Percentage

---

## 7. Candidate Scoring

Scoring Parameters

| Parameter | Weight |
|-----------|--------|
| Skills | 60% |
| Experience | 25% |
| Education | 15% |

---

## 8. AI Candidate Ranking

Automatically ranks candidates for every job.

Recommendation Levels

- Strong Candidate
- Good Candidate
- Average Candidate
- Not Recommended

---

## 9. Application Management

Recruiters can

- Apply Candidate to Job
- View Applications
- Update Application Status
- View Job Applications

---

## 10. Recruiter Authentication

Implemented

- Register
- Login
- JWT Authentication
- Protected APIs

---

## 11. Dashboard

Dashboard displays

- Total Candidates
- Total Jobs
- Strong Candidates
- Good Candidates
- Average Candidates

---

## 12. React Frontend

Developed a responsive frontend with

- Dashboard
- Candidates Page
- Jobs Page
- Applications Page
- Rankings Page
- Navigation Bar

---

# REST API Endpoints

## Authentication

```
POST /auth/register

POST /auth/login
```

---

## AI Services

```
POST /ai/upload_resume

POST /ai/evaluate_candidate

POST /ai/match_candidate

POST /ai/score_candidate

POST /ai/rank_candidate

GET /ai/rankings
```

---

## Jobs

```
POST /jobs

GET /jobs

GET /jobs/{id}/rankings

GET /jobs/{id}/top_candidates
```

---

## Candidates

```
GET /candidates

GET /candidates/{id}

PUT /candidates/{id}

DELETE /candidates/{id}
```

---

## Applications

```
POST /applications

GET /applications

PUT /applications/{id}

GET /jobs/{job_id}/applications
```

---

## Dashboard

```
GET /dashboard/stats
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AI-Recruitment-Assistant.git
```

---

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app:app --reload
```

Backend runs at

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---


# Future Enhancements

- Email Notifications
- Interview Scheduling
- Resume Recommendation Engine
- AI Chatbot for Recruiters
- Resume PDF Reports
- Cloud Deployment
- Multi-language Resume Parsing
- Advanced Analytics Dashboard

---

# Project Status

## Completed

- FastAPI Backend
- React Frontend
- AI Resume Parser
- Groq AI Integration
- Candidate CRUD
- Job CRUD
- Resume Upload
- Candidate Evaluation
- Skill Matching
- Candidate Ranking
- Application Management
- Recruiter Authentication
- Dashboard Analytics
- Swagger API Documentation

**Project Status:** ✅ Completed

---

# Developed By

**Kunjal Vanra**

Final Year Student

Computer Science & Engineering

Academic Project – 2026

---

# License

This project is developed for educational and academic purposes.