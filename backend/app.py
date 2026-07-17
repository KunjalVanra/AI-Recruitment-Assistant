from fastapi import FastAPI, UploadFile, File
import os
import shutil

from parser import extract_text_from_pdf

app = FastAPI(title="AI Recruitment Assistant")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def home():
    return {
        "message": "AI Recruitment Assistant API is Running!"
    }

@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text_from_pdf(file_path)

    return {
        "filename": file.filename,
        "resume_text": extracted_text
    }