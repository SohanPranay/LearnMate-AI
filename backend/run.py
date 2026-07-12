import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"LearnMate AI Backend Running in Python on Port {port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
