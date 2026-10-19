import json
from services.groq_service import client


def extract_job_skills(job_description):

    prompt = f"""
You are an AI recruitment assistant.

Analyze the following job description.

Extract:

- Required skills
- Experience requirement
- Education requirement

Return ONLY a valid JSON object.

Use EXACTLY this format:

{{
    "required_skills": [],
    "experience_requirement": "",
    "education_requirement": ""
}}

Rules:
- required_skills must be an array of strings.
- experience_requirement must be a string.
- education_requirement must be a string.
- If something is not mentioned, use an empty string or empty array.
- Do not use markdown.
- Do not use ```json.
- Do not add explanations outside the JSON.

Job Description:

{job_description}
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
        max_tokens=2000
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

        if start == -1 or end == 0:
            raise ValueError(
                "AI returned invalid JSON"
            )

        json_text = clean[start:end]

        return json.loads(json_text)