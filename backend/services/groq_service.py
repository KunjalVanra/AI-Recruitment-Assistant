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

Analyze the following resume and return ONLY valid JSON.

Extract:

- Name
- Email
- Phone
- Skills
- Education
- Experience
- Experience years
- Projects
- Certifications

Experience years should be a number.

Examples:

No experience:
0

6 month internship:
0.5

1 year job:
1

3 year job:
3

Resume:
{resume_text}
"""


    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )


    return response.choices[0].message.content