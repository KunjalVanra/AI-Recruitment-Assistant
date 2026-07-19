from scoring_service import (
    calculate_experience_score,
    calculate_education_score,
    calculate_overall_score
)


experience = calculate_experience_score(2)

education = calculate_education_score(
    "Bachelor of Engineering"
)


result = calculate_overall_score(
    skills_score=80,
    experience_score=experience,
    education_score=education
)


print(result)