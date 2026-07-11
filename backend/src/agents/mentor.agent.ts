type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export interface HistoryMessage {
  role: "user" | "mentor";
  text: string;
}

interface MentorReplyInput {
  question: string;
  currentModule: string;
  skillLevel: SkillLevel;
  history?: HistoryMessage[];
}

interface MentorReplyResult {
  answer: string;
  tips: string[];
  resources: string[];
  nextAction: string;
}

const MODULE_RESOURCE_MAP: Record<string, string[]> = {
  javascript: [
    "MDN JavaScript Guide",
    "JavaScript.info practical chapters",
    "Frontend Mentor JavaScript challenges",
  ],
  react: [
    "React official docs",
    "Kent C. Dodds React patterns",
    "React TypeScript cheatsheets",
  ],
  "next.js": [
    "Next.js official docs",
    "Vercel Learn: Next.js",
    "Web.dev performance optimization guides",
  ],
  "system design": [
    "System Design Primer",
    "Designing Data-Intensive Applications notes",
    "Scalability architecture case studies",
  ],
  "data structures": [
    "NeetCode roadmap",
    "GeeksforGeeks DSA patterns",
    "Big-O complexity cheat sheet",
  ],
};

const DEFAULT_RESOURCES = [
  "LearnMate roadmap module notes",
  "Official documentation for your current module",
  "One hands-on mini project to reinforce concepts",
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function generateDynamicResponse(question: string, currentModule: string, skillLevel: SkillLevel): string {
  const qLower = question.toLowerCase();
  
  // Simple deterministic hash to vary outputs per question
  let hash = 0;
  for (let i = 0; i < question.length; i++) {
    hash = question.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const pick = (arr: string[]) => arr[Math.abs(hash) % arr.length];
  const pickOffset = (arr: string[], offset: number) => arr[Math.abs(hash + offset) % arr.length];

  // Openings
  const openings = [
    "That is an excellent question!",
    "Great question. Let's break this down step-by-step.",
    "Understanding this is key to leveling up your development skills.",
    "Let's dive into this concept together.",
    "This is a very frequent topic of discussion among developers."
  ];

  // Greetings & Small Talk
  const smallTalk = [
    "I'm doing great, thank you for asking! Ready to tackle any coding challenges today.",
    "Doing fantastic! I hope your coding sessions are going well.",
    "Excellent! I'm here as your AI mentor, ready to help you learn.",
    "I'm up and running, excited to help you build some amazing projects!"
  ];

  if (qLower.includes("how are you") || qLower.includes("how is it going") || qLower.includes("how's it going")) {
    return `${pick(smallTalk)} We are currently focusing on the ${currentModule} module. What specific concept would you like to explore next?`;
  }

  if (qLower.includes("hello") || qLower.includes("hi") || qLower.includes("hey") || qLower.includes("greetings")) {
    return `Hello! I am MentorAI. I'm here to help guide you through your learning journey in ${currentModule}. What concept, project, or bug can we look at today?`;
  }

  // Core Subjects
  let subject = "this topic";
  let details = "";
  
  if (qLower.includes("react") || qLower.includes("hook") || qLower.includes("state") || qLower.includes("component")) {
    subject = "React components and state management";
    details = pick([
      "React works by managing a virtual representation of the DOM and updating only the elements that change.",
      "Using state hooks like useState lets you add memory to functional components.",
      "Remember that React state updates are asynchronous, so state changes are batched for efficiency."
    ]);
  } else if (qLower.includes("javascript") || qLower.includes("js") || qLower.includes("async") || qLower.includes("promise")) {
    subject = "JavaScript fundamentals";
    details = pick([
      "JavaScript utilizes an asynchronous event loop to handle execution without blocking the single thread.",
      "Scope (local, global, and block) determines where variables can be accessed inside your functions.",
      "Using const by default makes your bindings immutable and prevents accidental redeclarations."
    ]);
  } else if (qLower.includes("css") || qLower.includes("flex") || qLower.includes("grid") || qLower.includes("layout")) {
    subject = "CSS layout engines";
    details = pick([
      "Flexbox is ideal for one-dimensional layouts, while CSS Grid is perfect for two-dimensional grids.",
      "The CSS Box Model controls width, height, padding, borders, and margins of block level items.",
      "Responsive design lets your UI adjust automatically across diverse screen resolutions."
    ]);
  } else {
    // Extract a prominent word from user's question to personalize it
    const words = qLower.split(/\s+/).filter(w => w.length > 4 && !["about", "there", "would", "their", "could", "should"].includes(w));
    if (words.length > 0) {
      subject = `"${words[0]}"`;
      details = `When working with ${subject}, the primary goal is to keep code clean and modular. A common mistake is over-engineering the architecture before the core features are validated.`;
    } else {
      subject = "this programming concept";
      details = "It's best understood by writing small tests, checking outputs, and iterating on your logic in real-time.";
    }
  }

  const explanations = [
    `Regarding ${subject}: ${details}`,
    `Let's look at ${subject}. ${details}`,
    `Here is the key thing about ${subject}: ${details}`,
    `When analyzing ${subject}, remember that ${details}`
  ];

  const closings = [
    "Try writing a quick script to test this out. What does it log to the console?",
    "Does this make sense, or would you like to see a code example?",
    "Give it a try in your project workspace and see how it behaves!",
    "Keep practicing this—repetition builds strong mental models!"
  ];

  return `${pick(openings)} ${pickOffset(explanations, 1)} ${pickOffset(closings, 2)}`;
}

function resourcesForModule(currentModule: string): string[] {
  const normalizedModule = normalizeText(currentModule);

  for (const key of Object.keys(MODULE_RESOURCE_MAP)) {
    if (normalizedModule.includes(key)) {
      return MODULE_RESOURCE_MAP[key];
    }
  }

  return DEFAULT_RESOURCES;
}

export async function mentorReply(input: MentorReplyInput): Promise<MentorReplyResult> {
  const dynamicAnswer = generateDynamicResponse(input.question, input.currentModule, input.skillLevel);

  let hash = 0;
  for (let i = 0; i < input.question.length; i++) {
    hash = input.question.charCodeAt(i) + ((hash << 5) - hash);
  }

  const tipsOptions = [
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
  ];

  const nextActions = [
    `Write a 50-word summary of what you've learned about ${input.currentModule} today.`,
    `Implement a simple mock version of this concept in your workspace.`,
    `Take a 5-minute break, then write down three key takeaways.`
  ];

  const pick = (arr: any[]) => arr[Math.abs(hash) % arr.length];

  return {
    answer: dynamicAnswer,
    tips: pick(tipsOptions),
    resources: resourcesForModule(input.currentModule),
    nextAction: pick(nextActions),
  };
}

export default mentorReply;
