import json
from services.granite_service import call_granite

def extract_json(text: str) -> dict:
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            json_str = text[start:end + 1]
            try:
                return json.loads(json_str)
            except Exception as e:
                raise ValueError(f"Failed to parse extracted JSON string: {e}")
        raise ValueError("No JSON object found in response")

def assess_student(data: dict) -> dict:
    name = data.get("name", "Student")
    career_goal = data.get("careerGoal", "Frontend Developer")
    current_skill = data.get("currentSkill", "Beginner")
    weekly_hours = data.get("weeklyHours", 5)
    learning_style = data.get("learningStyle", "practical")
    preferred_language = data.get("preferredLanguage", "English")
    interests = data.get("interests", [])

    prompt = f"""
You are an expert AI Career Mentor.

Analyze the student's profile and provide a personalized assessment.

Student Profile

Name: {name}
Career Goal: {career_goal}
Current Skill: {current_skill}
Weekly Study Hours: {weekly_hours}
Learning Style: {learning_style}
Preferred Language: {preferred_language}
Interests: {", ".join(interests)}

Respond ONLY in JSON using this exact format:

{{
  "skillScore": number,
  "difficulty": "...",
  "knowledgeGaps": ["...", "..."],
  "strengths": ["...", "..."],
  "estimatedDuration": "...",
  "personalizedAdvice": "..."
}}
"""

    try:
        response = call_granite(prompt)
        text_out = response["data"]["text"]
        print("========== GRANITE RESPONSE ==========")
        print(text_out)
        print("======================================")
        return extract_json(text_out)
    except Exception as error:
        print("=================================")
        print("IBM GRANITE ERROR / PARSE ERROR")
        print(error)
        print("=================================")

        # Fallback in case Granite is offline or returns invalid format
        score = 30 if current_skill == "Beginner" else (60 if current_skill == "Intermediate" else 85)
        duration = "6 Months" if current_skill == "Beginner" else ("4 Months" if current_skill == "Intermediate" else "2 Months")

        return {
            "skillScore": score,
            "difficulty": current_skill,
            "knowledgeGaps": [
                f"Core {career_goal} concepts",
                "Enterprise architecture and tools"
            ],
            "strengths": [
                "Commitment to weekly study hours",
                "Clear professional career objective"
            ],
            "estimatedDuration": duration,
            "personalizedAdvice": f"Based on your interest in {', '.join(interests)}, we recommend focusing on hands-on practical building using a {learning_style} learning style."
        }
