import os
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import local services and agents
import db as mongo_db
from services.granite_service import call_granite
from agents.assessment_agent import assess_student
from agents.planner_agent import generate_roadmap
from agents.mentor_agent import mentor_reply

app = FastAPI(title="LearnMate AI API", version="1.0.0")

# Replicate Express CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_ASSESSMENT = {
    "student": {
        "name": "Alex",
        "careerGoal": "Frontend Developer",
        "currentSkill": "Beginner",
        "weeklyHours": 8,
        "learningStyle": "practical",
        "preferredLanguage": "English",
        "interests": ["React", "UI design", "Web apps"],
    },
    "skillScore": 35,
    "difficulty": "Beginner",
    "knowledgeGaps": ["Modern JavaScript basics", "CSS layout systems", "State management"],
    "strengths": ["Highly structured learner", "Consistent study hours"],
    "estimatedDuration": "6 Months",
    "personalizedAdvice": "Start by completing the HTML/CSS layout module. Focus on implementing 3 interactive UI components this week."
}

# Global in-memory cache, initialized from DB if possible
import hashlib

class StudentProfile(BaseModel):
    name: str
    careerGoal: str
    currentSkill: str
    weeklyHours: int
    learningStyle: str
    preferredLanguage: str
    interests: List[str]

class ChatHistoryMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    question: str
    currentModule: Optional[str] = "this module"
    skillLevel: Optional[str] = "Beginner"
    history: Optional[List[ChatHistoryMessage]] = []

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SkillItem(BaseModel):
    name: str
    level: str # "Learning" or "Mastered"

class ProfileUpdateRequest(BaseModel):
    skills: List[SkillItem]
    languages: List[str]
    skillScore: int
    name: Optional[str] = None
    careerGoal: Optional[str] = None
    currentSkill: Optional[str] = None
    weeklyHours: Optional[int] = None
    learningStyle: Optional[str] = None
    preferredLanguage: Optional[str] = None
    interests: Optional[List[str]] = None

@app.get("/")
def get_root():
    return {"message": "LearnMate AI Backend Running"}

# --- AUTH ROUTES ---

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    email_clean = req.email.strip().lower()
    if not email_clean or not req.password or not req.name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, email, and password are required."
        )
    
    existing_user = mongo_db.find_user_by_email(email_clean)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists."
        )
        
    password_hash = hashlib.sha256(req.password.encode()).hexdigest()
    
    user_doc = {
        "name": req.name,
        "email": email_clean,
        "password_hash": password_hash,
        "skills": [],
        "languages": [],
        "skillScore": 35,
        "careerGoal": "Frontend Developer",
        "currentSkill": "Beginner",
        "weeklyHours": 5,
        "learningStyle": "practical",
        "preferredLanguage": "English",
        "interests": []
    }
    
    mongo_db.save_user(user_doc)
    
    # Return user details without password
    user_doc.pop("password_hash", None)
    return {
        "success": True,
        "message": "User registered successfully.",
        "user": user_doc
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    email_clean = req.email.strip().lower()
    user = mongo_db.find_user_by_email(email_clean)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password."
        )
        
    password_hash = hashlib.sha256(req.password.encode()).hexdigest()
    if user.get("password_hash") != password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password."
        )
        
    user.pop("password_hash", None)
    return {
        "success": True,
        "message": "Login successful.",
        "user": user
    }

# --- PROFILE ROUTES ---

@app.get("/api/profile")
def get_profile(email: Optional[str] = Query(None)):
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email parameter is required."
        )
    user = mongo_db.find_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found."
        )
    user.pop("password_hash", None)
    return {
        "success": True,
        "user": user
    }

@app.post("/api/profile")
def update_profile(req: ProfileUpdateRequest, email: Optional[str] = Query(None)):
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email parameter is required."
        )
    
    profile_dict = req.model_dump(exclude_unset=True)
    
    # Check if there is an existing user
    user = mongo_db.find_user_by_email(email)
    if not user:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
         
    success = mongo_db.update_user_profile(email, profile_dict)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile."
        )
        
    updated_user = mongo_db.find_user_by_email(email)
    updated_user.pop("password_hash", None)
    return {
        "success": True,
        "message": "Profile updated successfully.",
        "user": updated_user
    }

# --- ASSESSMENT ROUTES ---

@app.get("/api/assessment")
def get_assessment(email: Optional[str] = Query(None)):
    assessment = mongo_db.get_latest_assessment(email)
    if not assessment:
        # Create a copy so we do not mutate the global DEFAULT_ASSESSMENT dictionary
        assessment = dict(DEFAULT_ASSESSMENT)
    else:
        # Ensure it is a mutable dictionary copy
        assessment = dict(assessment)
        
    if email:
        user = mongo_db.find_user_by_email(email)
        if user and "skillScore" in user:
            assessment["skillScore"] = user["skillScore"]
            
    return {
        "success": True,
        "data": assessment
    }


@app.post("/api/assessment")
def submit_assessment(profile: StudentProfile, email: Optional[str] = Query(None)):
    try:
        profile_dict = profile.model_dump()
        
        # Call agent logic
        assessment = assess_student(profile_dict)
        
        assessment_data = {
            "student": profile_dict,
            **assessment
        }
        
        # Save to MongoDB Atlas / memory
        mongo_db.save_assessment(assessment_data, email)
        
        # If email is provided, also update their user profile details in DB
        if email:
            mongo_db.update_user_profile(email, {
                "careerGoal": profile_dict["careerGoal"],
                "currentSkill": profile_dict["currentSkill"],
                "weeklyHours": profile_dict["weeklyHours"],
                "learningStyle": profile_dict["learningStyle"],
                "preferredLanguage": profile_dict["preferredLanguage"],
                "interests": profile_dict["interests"],
                "skillScore": assessment.get("skillScore", 35) # sync skillScore from assessment
            })
        
        return {
            "success": True,
            "data": assessment_data
        }
    except Exception as e:
        print("Assessment Submit Error:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# --- ROADMAP ROUTES ---

@app.get("/api/roadmap")
def get_roadmap_endpoint(
    careerGoal: Optional[str] = None,
    currentSkill: Optional[str] = None,
    weeklyHours: Optional[int] = None,
    learningStyle: Optional[str] = None,
    interests: Optional[List[str]] = Query(None),
    email: Optional[str] = Query(None)
):
    assessment = mongo_db.get_latest_assessment(email) or DEFAULT_ASSESSMENT
    student_profile = assessment.get("student", DEFAULT_ASSESSMENT["student"])
    
    goal = careerGoal or student_profile.get("careerGoal", "Frontend Developer")
    skill = currentSkill or student_profile.get("currentSkill", "Beginner")
    hours = weeklyHours or student_profile.get("weeklyHours", 5)
    style = learningStyle or student_profile.get("learningStyle", "practical")
    
    # Handle array formatting from queries
    user_interests = interests or student_profile.get("interests", [])
    
    VALID_CAREERS = [
        "Frontend Developer",
        "Backend Developer",
        "Cybersecurity",
        "AI Engineer",
        "Data Science"
    ]
    if goal not in VALID_CAREERS:
        goal = "Frontend Developer"
        
    if skill not in ["Beginner", "Intermediate", "Advanced"]:
        skill = "Beginner"

    try:
        # Check cache / db first
        cached_roadmap = mongo_db.get_latest_roadmap(goal, email)
        if cached_roadmap:
            return {
                "success": True,
                "data": cached_roadmap
            }
            
        roadmap = generate_roadmap({
            "careerGoal": goal,
            "currentSkill": skill,
            "weeklyHours": hours,
            "learningStyle": style,
            "interests": user_interests
        })
        
        # Save to DB
        mongo_db.save_roadmap(roadmap, goal, email)
        
        return {
            "success": True,
            "data": roadmap
        }
    except Exception as e:
        print("Roadmap Generation Error:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate roadmap."
        )

@app.patch("/api/roadmap")
def patch_roadmap():
    return {
        "success": True,
        "message": "Roadmap updated successfully."
    }


# --- CHAT ROUTES ---

@app.get("/api/chat")
def get_chat():
    return {
        "success": True,
        "data": {
            "answer": "Hello! I'm MentorAI, powered by IBM Granite. Ask me anything about your learning journey.",
            "tips": [
                "Practice every day",
                "Build projects",
                "Revise consistently"
            ],
            "resources": [
                "IBM SkillsBuild",
                "MDN Docs",
                "freeCodeCamp"
            ],
            "nextAction": "Complete today's roadmap task."
        }
    }

@app.post("/api/chat")
def post_chat(req: ChatRequest):
    try:
        # Prepare variables
        question = req.question.strip()
        current_module = req.currentModule or "this module"
        skill_level = req.skillLevel or "Beginner"
        
        if skill_level not in ["Beginner", "Intermediate", "Advanced"]:
            skill_level = "Beginner"

        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A 'question' field is required."
            )

        # Call Local Fallback Mentor Reply
        mentor = mentor_reply({
            "question": question,
            "currentModule": current_module,
            "skillLevel": skill_level
        })

        answer = mentor["answer"]

        try:
            # Construct Granite conversational thread prompt
            history_prompt = ""
            for h in req.history:
                role_label = "Student" if h.role == "user" else "Mentor"
                history_prompt += f"{role_label}: {h.text}\n"

            granite_prompt = f"""You are MentorAI, a friendly, encouraging, and highly intelligent learning mentor built on IBM Granite.
The student is at a {skill_level} level studying {current_module}.
Here is the chat history between the Student and the Mentor:
{history_prompt}Student: {question}
Mentor (reply in under 120 words):"""

            granite_res = call_granite(granite_prompt)
            granite_text = granite_res["data"]["text"].strip()
            if granite_text:
                answer = granite_text
        except Exception as e:
            # Watsonx error, fallback to offline reply
            print("Watsonx generation failed, falling back to local responder:", e)

        return {
            "success": True,
            "data": {
                "answer": answer,
                "tips": mentor["tips"],
                "resources": mentor["resources"],
                "nextAction": mentor["nextAction"]
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print("Chat Error:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Mentor is unavailable right now."
        )
