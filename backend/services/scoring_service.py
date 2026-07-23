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



def calculate_experience_score(years):

    if years >= 5:
        return 100

    elif years >= 3:
        return 80

    elif years >= 1:
        return 60

    else:
        return 40



def calculate_education_score(degree):

    degree = degree.lower()


    if "master" in degree or "m.tech" in degree:
        return 100

    elif "bachelor" in degree or "b.e" in degree or "b.tech" in degree:
        return 90

    elif "diploma" in degree:
        return 70

    else:
        return 50
    
def calculate_overall_score(
        skills_score,
        experience_score,
        education_score
):

    overall = (
        skills_score * 0.60
        +
        experience_score * 0.25
        +
        education_score * 0.15
    )


    if overall >= 85:
        recommendation = "Strong Candidate"

    elif overall >= 70:
        recommendation = "Good Candidate"

    elif overall >= 50:
        recommendation = "Average Candidate"

    else:
        recommendation = "Not Recommended"


    return {
        "overall_score": round(overall,2),
        "recommendation": recommendation
    }

def calculate_total_experience(experience_data):

    total_years = 0


    if not experience_data:
        return 0


    try:

        for exp in experience_data:

            years = exp.get("Years")

            if years:
                total_years += float(years)


    except Exception:

        return 0


    return total_years