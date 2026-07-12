import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

import certifi

mongo_client = None
db = None

mongodb_uri = os.getenv("MONGODB_URI")

if mongodb_uri:
    try:
        # Create client with timeout so it doesn't hang indefinitely if offline
        mongo_client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
        # Test connection
        mongo_client.server_info()
        db = mongo_client.get_database("learnmate")
        print("Connected to MongoDB")
    except Exception as err:
        print(f"MongoDB connection skipped: {err}")
        mongo_client = None
        db = None
else:
    print("MongoDB connection skipped: MONGODB_URI not found in env.")

def save_assessment(assessment_data: dict):
    if db is not None:
        try:
            db.assessments.update_one(
                {"student.name": assessment_data["student"]["name"]},
                {"$set": assessment_data},
                upsert=True
            )
        except Exception as e:
            print(f"Failed to save assessment to MongoDB: {e}")

def get_latest_assessment(student_name: str = None) -> dict:
    if db is not None:
        try:
            query = {}
            if student_name:
                query = {"student.name": student_name}
            # Fetch latest inserted/updated document
            doc = db.assessments.find_one(query, sort=[("_id", -1)])
            if doc:
                doc.pop("_id", None)
                return doc
        except Exception as e:
            print(f"Failed to get assessment from MongoDB: {e}")
    return None

def save_roadmap(roadmap_data: dict, career_goal: str):
    if db is not None:
        try:
            db.roadmaps.update_one(
                {"careerGoal": career_goal},
                {"$set": roadmap_data},
                upsert=True
            )
        except Exception as e:
            print(f"Failed to save roadmap to MongoDB: {e}")

def get_latest_roadmap(career_goal: str) -> dict:
    if db is not None:
        try:
            doc = db.roadmaps.find_one({"careerGoal": career_goal})
            if doc:
                doc.pop("_id", None)
                return doc
        except Exception as e:
            print(f"Failed to get roadmap from MongoDB: {e}")
    return None

# --- AUTH HELPER FUNCTIONS ---

IN_MEMORY_USERS = {}

def save_user(user_doc: dict):
    if db is not None:
        try:
            db.users.insert_one(user_doc)
        except Exception as e:
            print(f"Failed to save user to MongoDB: {e}")
    else:
        email = user_doc.get("email", "").strip().lower()
        IN_MEMORY_USERS[email] = user_doc

def find_user_by_email(email: str) -> dict:
    email_clean = email.strip().lower()
    if db is not None:
        try:
            doc = db.users.find_one({"email": email_clean})
            if doc:
                doc.pop("_id", None)
                return doc
        except Exception as e:
            print(f"Failed to find user by email: {e}")
    else:
        return IN_MEMORY_USERS.get(email_clean)
    return None
