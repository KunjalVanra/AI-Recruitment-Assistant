from scoring_service import calculate_skill_match


candidate = [
    "Python",
    "SQL",
    "Machine Learning"
]


job = [
    "Python",
    "FastAPI",
    "SQL",
    "AWS"
]


result = calculate_skill_match(
    candidate,
    job
)


print(result)