from backend.services.job_service import extract_job_skills


job = """

Looking for Python Developer.

Required skills:
Python
FastAPI
SQL
AWS

Experience:
2 years

"""

result = extract_job_skills(job)

print(result)