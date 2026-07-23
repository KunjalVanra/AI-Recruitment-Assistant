import json
from services.groq_service import client

def extract_job_skills(job_description):

    prompt = f"""

You are an AI recruitment assistant.

Analyze this job description.

Extract:

- Required skills
- Experience requirement
- Education requirement

Return only JSON.

Job Description:

{job_description}

"""


    response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
    )


    text = response.choices[0].message.content

    clean = (
        text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )


    try:
        return json.loads(clean)

    except json.JSONDecodeError:

        start = clean.find("{")
        end = clean.rfind("}") + 1

        json_text = clean[start:end]

        return json.loads(json_text)