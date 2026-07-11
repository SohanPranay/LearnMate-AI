import callGranite from "../services/granite.service";

interface AssessmentInput {
  name: string;
  careerGoal: string;
  currentSkill: string;
  weeklyHours: number;
  learningStyle: string;
  preferredLanguage: string;
  interests: string[];
}

function extractJson(text: string) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      const jsonStr = text.substring(start, end + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        throw new Error(`Failed to parse extracted JSON string: ${e}`);
      }
    }
    throw new Error("No JSON object found in response");
  }
}

export async function assessStudent(data: AssessmentInput) {
  const {
    name,
    careerGoal,
    currentSkill,
    weeklyHours,
    learningStyle,
    preferredLanguage,
    interests,
  } = data;

  const prompt = `
You are an expert AI Career Mentor.

Analyze the student's profile and provide a personalized assessment.

Student Profile

Name: ${name}
Career Goal: ${careerGoal}
Current Skill: ${currentSkill}
Weekly Study Hours: ${weeklyHours}
Learning Style: ${learningStyle}
Preferred Language: ${preferredLanguage}
Interests: ${interests.join(", ")}

Respond ONLY in JSON using this exact format:

{
  "skillScore": number,
  "difficulty": "...",
  "knowledgeGaps": ["...", "..."],
  "strengths": ["...", "..."],
  "estimatedDuration": "...",
  "personalizedAdvice": "..."
}
`;

  try {
    const response = await callGranite(prompt);

    console.log("========== GRANITE RESPONSE ==========");
    console.log(response.data.text);
    console.log("======================================");

    const parsed = extractJson(response.data.text);
    return parsed;
  } catch (error) {
    console.error("=================================");
    console.error("IBM GRANITE ERROR / PARSE ERROR");
    console.error(error);
    console.error("=================================");

    // Fallback in case Granite is offline or returns invalid format
    return {
      skillScore: currentSkill === "Beginner" ? 30 : currentSkill === "Intermediate" ? 60 : 85,
      difficulty: currentSkill,
      knowledgeGaps: [
        `Core ${careerGoal} concepts`,
        "Enterprise architecture and tools",
      ],
      strengths: [
        "Commitment to weekly study hours",
        "Clear professional career objective",
      ],
      estimatedDuration: currentSkill === "Beginner" ? "6 Months" : currentSkill === "Intermediate" ? "4 Months" : "2 Months",
      personalizedAdvice: `Based on your interest in ${interests.join(", ")}, we recommend focusing on hands-on practical building using a ${learningStyle} learning style.`,
    };
  }
}