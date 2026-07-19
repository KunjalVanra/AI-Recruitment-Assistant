def calculate_skill_match(candidate_skills, required_skills):

    candidate_skills = [
        skill.lower()
        for skill in candidate_skills
    ]

    required_skills = [
        skill.lower()
        for skill in required_skills
    ]


    matched_skills = []

    missing_skills = []


    for skill in required_skills:

        if skill in candidate_skills:
            matched_skills.append(skill)

        else:
            missing_skills.append(skill)


    if len(required_skills) == 0:
        score = 0

    else:
        score = (
            len(matched_skills)
            /
            len(required_skills)
        ) * 100


    return {
        "skills_match": round(score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }