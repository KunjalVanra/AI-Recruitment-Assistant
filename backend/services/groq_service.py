from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env file")


client = Groq(
    api_key=GROQ_API_KEY
)


def analyze_resume(resume_text):

    prompt = f"""
You are an AI recruitment assistant.

Analyze the following resume.

Return ONLY a valid JSON object.
Do NOT use markdown.
Do NOT use ```json.
Do NOT add explanations before or after the JSON.

Use EXACTLY these keys:

{{
    "Name": "",
    "Email": "",
    "Phone": "",
    "Skills": [],
    "Education": [],
    "Experience": [],
    "Experience years": 0,
    "Projects": [],
    "Certifications": []
}}

Rules:
- Name, Email and Phone must be strings.
- Skills must be an array of strings.
- Education must be an array of objects.
- Experience must be an array of objects.
- Experience years must be a number.
- Projects must be an array of strings.
- Certifications must be an array of strings.
- If information is not available, use an empty string, empty array, or 0.
- Make sure the JSON is COMPLETE and ends with }}.
- Do not include any text outside the JSON.

Resume:
{resume_text}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=4000,
    )

    return response.choices[0].message.content