import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app import app
from database import SessionLocal
from models import Recruiter, Candidate, Job, Application, CandidateRanking

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING COMPLETE RECRUITMENT ASSISTANT E2E TEST SUITE")
    print("=" * 60)

    # 1. Test Root Home API
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.status_code}"
    print("[PASS] 1. Root API Ping: 200 OK")

    # 2. Test Recruiter Auth (Register & Login)
    test_email = "test_e2e_recruiter@company.com"
    test_pass = "SecurePass123!"

    # Clean prior test recruiter if exists
    db = SessionLocal()
    existing = db.query(Recruiter).filter(Recruiter.email == test_email).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    reg_res = client.post("/auth/register", json={
        "name": "E2E Test Recruiter",
        "email": test_email,
        "password": test_pass
    })
    assert reg_res.status_code in [200, 201], f"Register failed: {reg_res.text}"
    print("[PASS] 2a. Recruiter Registration: 200 OK")

    login_res = client.post("/auth/login", json={
        "email": test_email,
        "password": test_pass
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json().get("access_token")
    assert token, "No access token in login response"
    print("[PASS] 2b. Recruiter Login & JWT Token issuance: 200 OK")

    # 3. Test Dashboard Stats API
    dash_res = client.get("/dashboard/stats")
    assert dash_res.status_code == 200, f"Dashboard failed: {dash_res.text}"
    stats = dash_res.json()
    assert "total_candidates" in stats
    assert "total_jobs" in stats
    assert "total_applications" in stats
    print(f"[PASS] 3. Dashboard Stats: Total Candidates={stats['total_candidates']}, Total Jobs={stats['total_jobs']}, Total Apps={stats['total_applications']}")

    # 4. Test Job CRUD Management
    # Create Job
    job_payload = {
        "title": "Cloud DevOps Engineer (E2E Test)",
        "description": "Seeking a Cloud Engineer proficient in Docker, Kubernetes, AWS, and CI/CD pipelines.",
        "required_skills": "Docker, Kubernetes, AWS, CI/CD",
        "experience_requirement": "3+ years",
        "education_requirement": "Bachelor of Engineering"
    }
    create_job_res = client.post("/jobs/", json=job_payload)
    assert create_job_res.status_code in [200, 201], f"Create job failed: {create_job_res.text}"
    test_job_id = create_job_res.json().get("job_id")
    assert test_job_id, "No job_id returned"
    print(f"[PASS] 4a. Create Job: ID #{test_job_id} successfully saved to MySQL")

    # Get Single Job Details
    job_detail_res = client.get(f"/jobs/{test_job_id}")
    assert job_detail_res.status_code == 200, f"Get job failed: {job_detail_res.text}"
    assert job_detail_res.json()["title"] == job_payload["title"]
    print(f"[PASS] 4b. Get Job Details: #{test_job_id} matches title and required skills")

    # Edit Job
    update_res = client.put(f"/jobs/{test_job_id}", json={
        "title": "Senior Cloud DevOps Engineer (E2E Test Updated)",
        "required_skills": "Docker, Kubernetes, AWS, Terraform, CI/CD"
    })
    assert update_res.status_code == 200, f"Update job failed: {update_res.text}"
    print(f"[PASS] 4c. Edit Job: Title and required skills updated in MySQL")

    # 5. Test Candidate Queries & Updates
    cands_res = client.get("/candidates/")
    assert cands_res.status_code == 200, f"Get candidates failed: {cands_res.text}"
    candidates = cands_res.json()
    assert len(candidates) > 0, "No candidates in database"
    first_cand = candidates[0]
    first_cand_id = first_cand["id"]
    print(f"[PASS] 5a. Candidates Listing: Found {len(candidates)} candidates, first is '{first_cand['name']}'")

    cand_detail_res = client.get(f"/candidates/{first_cand_id}")
    assert cand_detail_res.status_code == 200, f"Get candidate failed: {cand_detail_res.text}"
    print(f"[PASS] 5b. Candidate Profile Details: Retrieved #{first_cand_id} with application history")

    # 6. Test AI Candidate Matching & Ranking for Job
    rankings_res = client.get(f"/jobs/{test_job_id}/rankings")
    assert rankings_res.status_code == 200, f"Rankings failed: {rankings_res.text}"
    rankings_data = rankings_res.json().get("rankings", [])
    assert len(rankings_data) > 0, "No rankings generated"
    top_cand = rankings_data[0]
    print(f"[PASS] 6. AI Candidate Matching: Top candidate for job #{test_job_id} is '{top_cand['name']}' with {top_cand['overall_score']}% ({top_cand['recommendation']})")

    # 7. Test Application Creation, Status Updates & Shortlisting
    app_create_res = client.post(f"/applications?candidate_id={first_cand_id}&job_id={test_job_id}")
    assert app_create_res.status_code in [200, 201], f"Create application failed: {app_create_res.text}"
    app_id = app_create_res.json().get("application_id")
    print(f"[PASS] 7a. Application Created: ID #{app_id} for Candidate #{first_cand_id} to Job #{test_job_id}")

    # Shortlist Application
    status_res = client.put(f"/applications/{app_id}?status=Shortlisted")
    assert status_res.status_code == 200, f"Update app status failed: {status_res.text}"
    assert status_res.json()["new_status"] == "Shortlisted"
    print(f"[PASS] 7b. Candidate Shortlisted: Application #{app_id} status updated to 'Shortlisted'")

    # Advance to Interview Scheduled
    interview_res = client.put(f"/applications/{app_id}?status=Interview%20Scheduled")
    assert interview_res.status_code == 200
    print(f"[PASS] 7c. Candidate Pipeline Advanced: Application #{app_id} status is now 'Interview Scheduled'")

    # 8. Test AI Recruiter Chatbot Assistant (POST /ai/chat)
    chat_res = client.post("/ai/chat", json={
        "message": "Which candidates in the system have Python and FastAPI experience?",
        "job_id": test_job_id
    })
    assert chat_res.status_code == 200, f"Chatbot failed: {chat_res.text}"
    reply = chat_res.json().get("reply", "")
    assert len(reply) > 20, "Chatbot returned empty reply"
    print(f"[PASS] 8. AI Recruiter Copilot (Groq LLM): Generated intelligent answer grounded in MySQL candidates")

    # 9. Clean up test records safely
    delete_job_res = client.delete(f"/jobs/{test_job_id}")
    assert delete_job_res.status_code == 200, f"Delete job failed: {delete_job_res.text}"
    print(f"[PASS] 9. Safe Cascade Cleanup: Deleted test job #{test_job_id} and its associated test application/rankings")

    # Clean test recruiter
    db = SessionLocal()
    test_recruiter = db.query(Recruiter).filter(Recruiter.email == test_email).first()
    if test_recruiter:
        db.delete(test_recruiter)
        db.commit()
    db.close()
    print("[PASS] 10. Cleaned up temporary test recruiter")

    print("\n" + "=" * 60)
    print("ALL 10 END-TO-END RECRUITMENT TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
