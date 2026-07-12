import json
from services.granite_service import call_granite

BASE_ROADMAPS = {
    "Frontend Developer": {
        "title": "Frontend Developer Career Roadmap",
        "weeklyPlan": [
            {
                "week": 1,
                "topic": "HTML, CSS, and responsive foundations",
                "description": "Build semantic layouts, modern CSS patterns, and mobile-first responsive design principles.",
                "resources": [
                    "MDN: HTML & CSS Guides",
                    "Frontend Mentor style challenge briefs",
                    "CSS Grid and Flexbox reference docs"
                ],
                "project": "Create a responsive portfolio homepage.",
                "quiz": "Quiz on semantic HTML and CSS layout systems."
            },
            {
                "week": 2,
                "topic": "JavaScript essentials and DOM control",
                "description": "Work with functions, arrays, async basics, and practical DOM interactions for interactive interfaces.",
                "resources": [
                    "JavaScript.info core chapters",
                    "MDN DOM API references",
                    "Short coding challenge set for JS fundamentals"
                ],
                "project": "Build an interactive task manager with filtering.",
                "quiz": "Quiz on array methods, closures, and async flow."
            },
            {
                "week": 3,
                "topic": "React component architecture",
                "description": "Learn component composition, props/state, hooks, and reusable UI patterns for scalable frontend apps.",
                "resources": [
                    "React official docs",
                    "Pattern libraries and component design examples",
                    "State management primer"
                ],
                "project": "Build a multi-page React learning dashboard.",
                "quiz": "Quiz on hooks, state flow, and component lifecycle."
            },
            {
                "week": 4,
                "topic": "Next.js and production deployment",
                "description": "Implement routing, data fetching, performance optimization, and deployment best practices.",
                "resources": [
                    "Next.js documentation",
                    "Vercel deployment guide",
                    "Web performance checklist"
                ],
                "project": "Launch a production-ready SaaS landing + dashboard shell.",
                "quiz": "Quiz on SSR, SSG, and route conventions."
            }
        ],
        "skills": ["HTML", "CSS", "JavaScript", "React", "Next.js", "UI Architecture"],
        "recommendedCourses": [
            "Modern React with TypeScript",
            "Advanced CSS for Scalable Design Systems",
            "Next.js for Production Applications"
        ],
        "milestones": [
            "Publish responsive portfolio project",
            "Ship one React app with reusable components",
            "Deploy Next.js application with strong Lighthouse scores"
        ]
    },
    "Backend Developer": {
        "title": "Backend Developer Career Roadmap",
        "weeklyPlan": [
            {
                "week": 1,
                "topic": "Node.js and API fundamentals",
                "description": "Understand Node runtime, REST design, request/response lifecycle, and clean controller-service structure.",
                "resources": [
                    "Node.js docs",
                    "Express API reference",
                    "REST API design best practices"
                ],
                "project": "Build CRUD APIs for a learning platform module.",
                "quiz": "Quiz on HTTP methods, status codes, and REST conventions."
            },
            {
                "week": 2,
                "topic": "Databases and data modeling",
                "description": "Design normalized schemas, indexes, relations, and reliable data access patterns.",
                "resources": [
                    "PostgreSQL or MongoDB schema design guides",
                    "Database indexing tutorial",
                    "ORM/ODM documentation"
                ],
                "project": "Design and implement roadmap and user persistence models.",
                "quiz": "Quiz on indexing, joins, and query optimization."
            },
            {
                "week": 3,
                "topic": "Authentication, authorization, and security",
                "description": "Implement JWT/session strategies, role-based access controls, and secure API practices.",
                "resources": [
                    "OWASP API Security Top 10",
                    "JWT implementation guides",
                    "Security hardening checklist"
                ],
                "project": "Add secure auth flow with role-based endpoints.",
                "quiz": "Quiz on secure token handling and access control."
            },
            {
                "week": 4,
                "topic": "Scalability and system design",
                "description": "Cover caching, queues, observability, deployment pipelines, and reliability strategies.",
                "resources": [
                    "System design interview primer",
                    "Redis and queue architecture examples",
                    "Monitoring and logging best practices"
                ],
                "project": "Build a scalable API with caching and background jobs.",
                "quiz": "Quiz on scalability, bottlenecks, and architecture tradeoffs."
            }
        ],
        "skills": ["Node.js", "Express", "Databases", "Auth", "Caching", "System Design"],
        "recommendedCourses": [
            "Backend Engineering with Node.js",
            "Database Design for Production",
            "Scalable System Design Fundamentals"
        ],
        "milestones": [
            "Ship secure CRUD APIs",
            "Implement robust database schema and indexing",
            "Deploy scalable backend with monitoring"
        ]
    },
    "Cybersecurity": {
        "title": "Cybersecurity Career Roadmap",
        "weeklyPlan": [
            {
                "week": 1,
                "topic": "Security foundations and networking",
                "description": "Understand TCP/IP, common attack surfaces, threat modeling, and defensive security principles.",
                "resources": [
                    "NIST Cybersecurity Framework overview",
                    "Networking fundamentals materials",
                    "Threat modeling playbook"
                ],
                "project": "Map threats for a sample SaaS architecture.",
                "quiz": "Quiz on core networking and attack vectors."
            },
            {
                "week": 2,
                "topic": "Web and API security",
                "description": "Study injection flaws, auth vulnerabilities, and secure coding patterns in web systems.",
                "resources": [
                    "OWASP Top 10",
                    "API security practical labs",
                    "Secure coding checklists"
                ],
                "project": "Assess and patch vulnerabilities in a demo API.",
                "quiz": "Quiz on OWASP risks and mitigations."
            },
            {
                "week": 3,
                "topic": "Monitoring, logging, and incident response",
                "description": "Build detection logic, tune alerts, and learn incident triage and response workflows.",
                "resources": [
                    "SIEM fundamentals",
                    "Incident response handbook",
                    "Log analysis exercises"
                ],
                "project": "Create incident response runbook for suspicious API activity.",
                "quiz": "Quiz on incident severity and response stages."
            },
            {
                "week": 4,
                "topic": "Cloud security and hardening",
                "description": "Apply IAM, secrets management, and policy hardening in cloud-native environments.",
                "resources": [
                    "Cloud provider security best practices",
                    "IAM design reference",
                    "Container security checklist"
                ],
                "project": "Harden a cloud deployment and produce a security baseline report.",
                "quiz": "Quiz on IAM policy and cloud misconfiguration patterns."
            }
        ],
        "skills": ["Network Security", "API Security", "Threat Detection", "Incident Response", "Cloud Security"],
        "recommendedCourses": [
            "Practical Web Security",
            "Cloud Security Essentials",
            "Incident Response and Detection Engineering"
        ],
        "milestones": [
            "Complete API vulnerability assessment",
            "Build actionable incident response playbook",
            "Publish cloud security hardening checklist"
        ]
    },
    "AI Engineer": {
        "title": "AI Engineer Career Roadmap",
        "weeklyPlan": [
            {
                "week": 1,
                "topic": "Python, ML foundations, and data pipelines",
                "description": "Cover core Python for ML, data preprocessing, feature engineering, and model evaluation metrics.",
                "resources": [
                    "Scikit-learn user guide",
                    "Feature engineering practical notes",
                    "Python data workflow references"
                ],
                "project": "Train baseline models for a classification dataset.",
                "quiz": "Quiz on preprocessing and model evaluation metrics."
            },
            {
                "week": 2,
                "topic": "Deep learning and model architecture",
                "description": "Learn neural network fundamentals, transfer learning, and training optimization.",
                "resources": [
                    "PyTorch or TensorFlow tutorials",
                    "Model architecture case studies",
                    "Experiment tracking primer"
                ],
                "project": "Build and evaluate a neural network model.",
                "quiz": "Quiz on optimization, overfitting, and generalization."
            },
            {
                "week": 3,
                "topic": "LLM applications and retrieval systems",
                "description": "Implement prompt engineering, embeddings, vector search, and retrieval-augmented generation flows.",
                "resources": [
                    "RAG architecture guides",
                    "Prompt engineering cookbook",
                    "Vector database tutorials"
                ],
                "project": "Build a domain assistant with retrieval augmentation.",
                "quiz": "Quiz on embeddings, chunking, and context strategies."
            },
            {
                "week": 4,
                "topic": "MLOps and model deployment",
                "description": "Package models, monitor drift, automate retraining, and deploy inference services reliably.",
                "resources": [
                    "MLOps lifecycle references",
                    "Model serving patterns",
                    "Observability for AI systems"
                ],
                "project": "Deploy an AI service with monitoring and versioned models.",
                "quiz": "Quiz on deployment reliability and model governance."
            }
        ],
        "skills": ["Python", "Machine Learning", "Deep Learning", "LLM Engineering", "MLOps"],
        "recommendedCourses": [
            "Machine Learning Engineering in Practice",
            "LLM Application Development",
            "MLOps for Production AI Systems"
        ],
        "milestones": [
            "Train and evaluate production-grade models",
            "Ship a retrieval-augmented AI application",
            "Deploy monitored AI service pipeline"
        ]
    },
    "Data Science": {
        "title": "Data Science Career Roadmap",
        "weeklyPlan": [
            {
                "week": 1,
                "topic": "Statistics and exploratory data analysis",
                "description": "Strengthen statistical reasoning, data cleaning workflows, and exploratory visualization techniques.",
                "resources": [
                    "Statistics refresher notes",
                    "Pandas and NumPy documentation",
                    "Data visualization best practice guide"
                ],
                "project": "Perform EDA and insight report for business dataset.",
                "quiz": "Quiz on probability, distributions, and inference."
            },
            {
                "week": 2,
                "topic": "Feature engineering and predictive modeling",
                "description": "Build robust features, compare models, and tune pipelines for performance and interpretability.",
                "resources": [
                    "Scikit-learn pipeline guide",
                    "Feature engineering handbook",
                    "Model evaluation reference"
                ],
                "project": "Create a predictive model with explainability outputs.",
                "quiz": "Quiz on feature leakage, validation, and model selection."
            },
            {
                "week": 3,
                "topic": "SQL, dashboards, and communication",
                "description": "Write analytical SQL, create dashboards, and communicate findings to stakeholders clearly.",
                "resources": [
                    "Advanced SQL scenarios",
                    "Dashboard design principles",
                    "Data storytelling frameworks"
                ],
                "project": "Build KPI dashboard and executive summary.",
                "quiz": "Quiz on SQL aggregation, window functions, and data storytelling."
            },
            {
                "week": 4,
                "topic": "Experimentation and decision science",
                "description": "Design A/B tests, evaluate impacts, and connect outcomes to business decisions.",
                "resources": [
                    "A/B testing methodology guide",
                    "Causal inference primer",
                    "Experiment analysis templates"
                ],
                "project": "Design and analyze an A/B test simulation.",
                "quiz": "Quiz on significance, power, and experiment validity."
            }
        ],
        "skills": ["Statistics", "Python", "SQL", "Data Visualization", "Experimentation"],
        "recommendedCourses": [
            "Applied Data Science with Python",
            "SQL for Analytics",
            "Experimentation and Causal Inference"
        ],
        "milestones": [
            "Deliver complete EDA and model report",
            "Build stakeholder-ready analytics dashboard",
            "Lead end-to-end experimentation analysis"
        ]
    }
}

def calculate_estimated_duration(current_skill: str, weekly_hours: float) -> str:
    base_months = {
        "Beginner": 6,
        "Intermediate": 4,
        "Advanced": 3
    }
    base = base_months.get(current_skill, 6)
    pace_adjustment = -1 if weekly_hours >= 12 else (1 if weekly_hours <= 5 else 0)
    total_months = max(2, base + pace_adjustment)
    return f"{total_months} Months"

def personalize_weekly_plan(weekly_plan: list, learning_style: str, interests: list) -> list:
    interest_label = ", ".join(interests) if interests else "real-world applications"
    style = learning_style.strip() if learning_style else "practical"
    
    personalized = []
    for item in weekly_plan:
        updated = dict(item)
        updated["description"] = f"{item['description']} Learning style focus: {style}. Interest alignment: {interest_label}."
        personalized.append(updated)
    return personalized

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

def generate_roadmap(input_data: dict) -> dict:
    career_goal = input_data.get("careerGoal", "Frontend Developer")
    current_skill = input_data.get("currentSkill", "Beginner")
    weekly_hours = float(input_data.get("weeklyHours", 5))
    learning_style = input_data.get("learningStyle", "practical")
    interests = input_data.get("interests", [])

    base_roadmap = BASE_ROADMAPS.get(career_goal, BASE_ROADMAPS["Frontend Developer"])
    duration = calculate_estimated_duration(current_skill, weekly_hours)

    prompt = f"""
You are an expert AI Learning Planner powered by IBM Granite.
Create a highly personalized learning roadmap for a student.

Student Profile:
- Career Goal: {career_goal}
- Current Skill Level: {current_skill}
- Weekly Study Hours: {weekly_hours} hours
- Learning Style: {learning_style}
- Interests: {", ".join(interests)}

Base Roadmap reference:
{json.dumps(base_roadmap, indent=2)}

Please customize and expand this roadmap. Respond ONLY in valid JSON matching the following schema. Ensure all descriptions, projects, and resources are customized to match their learning style ({learning_style}) and interests ({", ".join(interests)}).

JSON Schema:
{{
  "title": "...",
  "estimatedDuration": "{duration}",
  "weeklyPlan": [
    {{
      "week": number,
      "topic": "...",
      "description": "...",
      "resources": ["...", "..."],
      "project": "...",
      "quiz": "..."
    }}
  ],
  "skills": ["...", "..."],
  "recommendedCourses": ["...", "..."],
  "milestones": ["...", "..."]
}}
"""

    try:
        response = call_granite(prompt)
        text_out = response["data"]["text"]
        print("========== GRANITE ROADMAP RESPONSE ==========")
        print(text_out)
        print("==============================================")
        return extract_json(text_out)
    except Exception as error:
        print("=================================")
        print("IBM GRANITE ROADMAP ERROR / PARSE ERROR")
        print(error)
        print("=================================")

        personalized_plan = personalize_weekly_plan(
            base_roadmap["weeklyPlan"],
            learning_style,
            interests
        )

        return {
            "title": base_roadmap["title"],
            "estimatedDuration": duration,
            "weeklyPlan": personalized_plan,
            "skills": base_roadmap["skills"],
            "recommendedCourses": base_roadmap["recommendedCourses"],
            "milestones": base_roadmap["milestones"]
        }
