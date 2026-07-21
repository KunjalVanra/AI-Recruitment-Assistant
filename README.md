
```markdown
# AI Recruitment Assistant

An AI-powered recruitment system that helps recruiters analyze resumes, match candidates with job requirements, and rank candidates automatically.

## Project Overview

The AI Recruitment Assistant uses Artificial Intelligence to automate the initial candidate screening process.

The system can:
- Upload candidate resumes
- Extract resume information using AI
- Store candidate details in MySQL
- Analyze job descriptions
- Match candidate skills with job requirements
- Rank candidates based on suitability

---

# Tech Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- MySQL
- Groq AI API

## AI Features

- Resume analysis
- Information extraction
- Skill matching
- Candidate scoring
- Candidate ranking

## Tools

- Uvicorn
- Git & GitHub

---

# Backend Structure

```

backend/

├── app.py
├── groq_service.py
├── job_service.py
├── scoring_service.py
├── parser.py
├── database.py
├── models.py
├── requirements.txt
└── uploads/

```

---

# Completed Features

## 1. Resume Upload System ✅

- Upload PDF resumes
- Extract text from PDF
- Analyze resume using Groq AI
- Convert AI output into structured JSON

---

## 2. Candidate Database Integration ✅

- Connected MySQL database
- Added Candidate model
- Stored:

  - Name
  - Email
  - Phone
  - Skills
  - Education
  - Experience
  - Resume file

---

## 3. Duplicate Resume Prevention ✅

- Added email-based duplicate checking
- Prevents storing the same candidate multiple times

---

## 4. Candidate Search System ✅

Supported filters:

```

GET /candidates?skill=Python

GET /candidates?name=KUNJAL

GET /candidates?experience=2

```

---

## 5. Candidate Management APIs ✅

Implemented:

```

GET /candidates

```
View all candidates


```

GET /candidate/{id}

```
View candidate details


```

PUT /candidate/{id}

```
Update candidate information


```

DELETE /candidate/{id}

```
Delete candidate

---

## 6. Candidate Ranking System ✅

Implemented automatic candidate scoring using:

- Skills score (60%)
- Experience score (25%)
- Education score (15%)

Ranking output includes:

- Overall score
- Candidate recommendation

Example:

```

Strong Candidate
Good Candidate
Average Candidate
Not Recommended

```

---

# How to Run Backend

Go to backend folder:

```

cd backend

```

Install dependencies:

```

pip install -r requirements.txt

```

Start server:

```

uvicorn app:app --reload

```

API Documentation:

```

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

```

---

# Current Progress

Backend Completion:

✅ FastAPI Setup  
✅ Groq AI Integration  
✅ Resume Parser  
✅ Resume Upload  
✅ MySQL Database  
✅ Candidate CRUD APIs  
✅ Candidate Search  
✅ Candidate Ranking  

---

# Upcoming Features

- Job Management System
- Store Job Descriptions
- Job-based Candidate Ranking
- Recruiter Dashboard
- Authentication System
- React Frontend
- Deployment
```

---

