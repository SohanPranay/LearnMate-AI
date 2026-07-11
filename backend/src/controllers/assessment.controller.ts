import { Request, Response } from "express";
import { assessStudent } from "../agents/assessment.agent";

const DEFAULT_ASSESSMENT = {
  student: {
    name: "Alex",
    careerGoal: "Frontend Developer",
    currentSkill: "Beginner",
    weeklyHours: 8,
    learningStyle: "practical",
    preferredLanguage: "English",
    interests: ["React", "UI design", "Web apps"],
  },
  skillScore: 35,
  difficulty: "Beginner",
  knowledgeGaps: ["Modern JavaScript basics", "CSS layout systems", "State management"],
  strengths: ["Highly structured learner", "Consistent study hours"],
  estimatedDuration: "6 Months",
  personalizedAdvice: "Start by completing the HTML/CSS layout module. Focus on implementing 3 interactive UI components this week."
};

export let latestAssessment: any = null;

export function getAssessment(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    data: latestAssessment || DEFAULT_ASSESSMENT,
  });
}

export async function submitAssessment(req: Request, res: Response) {
  try {
    const {
      name,
      careerGoal,
      currentSkill,
      weeklyHours,
      learningStyle,
      preferredLanguage,
      interests,
    } = req.body;

    if (
      !name ||
      !careerGoal ||
      !currentSkill ||
      !weeklyHours ||
      !learningStyle ||
      !preferredLanguage ||
      !interests
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const assessment = await assessStudent({
      name,
      careerGoal,
      currentSkill,
      weeklyHours,
      learningStyle,
      preferredLanguage,
      interests,
    });

    latestAssessment = {
      student: {
        name,
        careerGoal,
        currentSkill,
        weeklyHours,
        learningStyle,
        preferredLanguage,
        interests,
      },
      ...assessment,
    };

    return res.status(200).json({
      success: true,
      data: latestAssessment,
    });
  } catch (error) {
    console.error("Assessment Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Internal Server Error",
    });
  }
}