MODULE_RESOURCE_MAP = {
    "javascript": [
        "MDN JavaScript Guide",
        "JavaScript.info practical chapters",
        "Frontend Mentor JavaScript challenges"
    ],
    "react": [
        "React official docs",
        "Kent C. Dodds React patterns",
        "React TypeScript cheatsheets"
    ],
    "next.js": [
        "Next.js official docs",
        "Vercel Learn: Next.js",
        "Web.dev performance optimization guides"
    ],
    "system design": [
        "System Design Primer",
        "Designing Data-Intensive Applications notes",
        "Scalability architecture case studies"
    ],
    "data structures": [
        "NeetCode roadmap",
        "GeeksforGeeks DSA patterns",
        "Big-O complexity cheat sheet"
    ]
}

DEFAULT_RESOURCES = [
    "LearnMate roadmap module notes",
    "Official documentation for your current module",
    "One hands-on mini project to reinforce concepts"
]

def generate_dynamic_response(question: str, current_module: str, skill_level: str) -> str:
    q_lower = question.lower()

    # Simple deterministic hash to vary outputs per question
    hash_val = 0
    for char in question:
        hash_val = ord(char) + ((hash_val << 5) - hash_val)
        # Keep hash within 32-bit int range
        hash_val = hash_val & 0xFFFFFFFF
        if hash_val & 0x80000000:
            hash_val = -((~hash_val & 0xFFFFFFFF) + 1)

    def pick(arr):
        return arr[abs(hash_val) % len(arr)]

    def pick_offset(arr, offset):
        return arr[abs(hash_val + offset) % len(arr)]

    # Openings
    openings = [
        "That is an excellent question!",
        "Great question. Let's break this down step-by-step.",
        "Understanding this is key to leveling up your development skills.",
        "Let's dive into this concept together.",
        "This is a very frequent topic of discussion among developers."
    ]

    # Greetings & Small Talk
    small_talk = [
        "I'm doing great, thank you for asking! Ready to tackle any coding challenges today.",
        "Doing fantastic! I hope your coding sessions are going well.",
        "Excellent! I'm here as your AI mentor, ready to help you learn.",
        "I'm up and running, excited to help you build some amazing projects!"
    ]

    if "how are you" in q_lower or "how is it going" in q_lower or "how's it going" in q_lower:
        return f"{pick(small_talk)} We are currently focusing on the {current_module} module. What specific concept would you like to explore next?"

    if any(greet in q_lower for greet in ["hello", "hi", "hey", "greetings"]):
        return f"Hello! I am MentorAI. I'm here to help guide you through your learning journey in {current_module}. What concept, project, or bug can we look at today?"

    # Core Subjects
    subject = "this topic"
    details = ""

    if any(keyword in q_lower for keyword in ["react", "hook", "state", "component"]):
        subject = "React components and state management"
        details = pick([
            "React works by managing a virtual representation of the DOM and updating only the elements that change.",
            "Using state hooks like useState lets you add memory to functional components.",
            "Remember that React state updates are asynchronous, so state changes are batched for efficiency."
        ])
    elif any(keyword in q_lower for keyword in ["javascript", "js", "async", "promise"]):
        subject = "JavaScript fundamentals"
        details = pick([
            "JavaScript utilizes an asynchronous event loop to handle execution without blocking the single thread.",
            "Scope (local, global, and block) determines where variables can be accessed inside your functions.",
            "Using const by default makes your bindings immutable and prevents accidental redeclarations."
        ])
    elif any(keyword in q_lower for keyword in ["css", "flex", "grid", "layout"]):
        subject = "CSS layout engines"
        details = pick([
            "Flexbox is ideal for one-dimensional layouts, while CSS Grid is perfect for two-dimensional grids.",
            "The CSS Box Model controls width, height, padding, borders, and margins of block level items.",
            "Responsive design lets your UI adjust automatically across diverse screen resolutions."
        ])
    else:
        # Extract a prominent word from user's question to personalize it
        words = [w for w in q_lower.split() if len(w) > 4 and w not in ["about", "there", "would", "their", "could", "should"]]
        if words:
            subject = f'"{words[0]}"'
            details = f"When working with {subject}, the primary goal is to keep code clean and modular. A common mistake is over-engineering the architecture before the core features are validated."
        else:
            subject = "this programming concept"
            details = "It's best understood by writing small tests, checking outputs, and iterating on your logic in real-time."

    explanations = [
        f"Regarding {subject}: {details}",
        f"Let's look at {subject}. {details}",
        f"Here is the key thing about {subject}: {details}",
        f"When analyzing {subject}, remember that {details}"
    ]

    closings = [
        "Try writing a quick script to test this out. What does it log to the console?",
        "Does this make sense, or would you like to see a code example?",
        "Give it a try in your project workspace and see how it behaves!",
        "Keep practicing this—repetition builds strong mental models!"
    ]

    return f"{pick(openings)} {pick_offset(explanations, 1)} {pick_offset(closings, 2)}"

def get_resources_for_module(current_module: str) -> list:
    mod_lower = current_module.strip().lower()
    for key, val in MODULE_RESOURCE_MAP.items():
        if key in mod_lower:
            return val
    return DEFAULT_RESOURCES

def mentor_reply(input_data: dict) -> dict:
    question = input_data.get("question", "")
    current_module = input_data.get("currentModule", "this module")
    skill_level = input_data.get("skillLevel", "Beginner")

    dynamic_answer = generate_dynamic_response(question, current_module, skill_level)

    hash_val = 0
    for char in question:
        hash_val = ord(char) + ((hash_val << 5) - hash_val)
        hash_val = hash_val & 0xFFFFFFFF
        if hash_val & 0x80000000:
            hash_val = -((~hash_val & 0xFFFFFFFF) + 1)

    tips_options = [
        [
            "Break down the topic into smaller units and test them individually.",
            "Document your understanding in your study journal.",
            "Validate this concept by explaining it in simple terms."
        ],
        [
            "Try to build a 10-line sandbox script to verify the theory.",
            "Look up the MDN documentation for edge cases.",
            "Compare this approach with an alternative method."
        ],
        [
            "Examine the call stack if you encounter a runtime error.",
            "Write comments explaining the 'why' behind the logic.",
            "Ask a peer to review your implementation code."
        ]
    ]

    next_actions = [
        f"Write a 50-word summary of what you've learned about {current_module} today.",
        f"Implement a simple mock version of this concept in your workspace.",
        f"Take a 5-minute break, then write down three key takeaways."
    ]

    tips = tips_options[abs(hash_val) % len(tips_options)]
    next_action = next_actions[abs(hash_val) % len(next_actions)]

    return {
        "answer": dynamic_answer,
        "tips": tips,
        "resources": get_resources_for_module(current_module),
        "nextAction": next_action
    }
