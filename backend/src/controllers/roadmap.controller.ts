import { Request, Response } from "express";
import { generateRoadmap } from "../agents/planner.agent";
import { latestAssessment } from "./assessment.controller";

type CareerGoal =
  | "Frontend Developer"
  | "Backend Developer"
  | "Cybersecurity"
  | "AI Engineer"
  | "Data Science";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

const VALID_CAREERS: CareerGoal[] = [
  "Frontend Developer",
  "Backend Developer",
  "Cybersecurity",
  "AI Engineer",
  "Data Science",
];

export async function getRoadmap(req: Request, res: Response) {
  try {
    const studentProfile = latestAssessment?.student;

    const careerGoalParam = String(req.query.careerGoal || studentProfile?.careerGoal || "Frontend Developer");
    const currentSkillParam = String(req.query.currentSkill || studentProfile?.currentSkill || "Beginner");
    const weeklyHoursParam = Number(req.query.weeklyHours || studentProfile?.weeklyHours || 5);
    const learningStyle = String(req.query.learningStyle || studentProfile?.learningStyle || "practical");
    const interestsParam = req.query.interests || studentProfile?.interests;

    const careerGoal = (VALID_CAREERS.includes(careerGoalParam as CareerGoal)
      ? careerGoalParam
      : "Frontend Developer") as CareerGoal;

    const currentSkill = (["Beginner", "Intermediate", "Advanced"].includes(currentSkillParam)
      ? currentSkillParam
      : "Beginner") as SkillLevel;

    const interests = Array.isArray(interestsParam)
      ? interestsParam.map(String)
      : interestsParam
        ? [String(interestsParam)]
        : [];

    const roadmap = await generateRoadmap({
      careerGoal,
      currentSkill,
      weeklyHours: Number.isFinite(weeklyHoursParam) ? weeklyHoursParam : 5,
      learningStyle,
      interests,
    });

    res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate roadmap.",
    });
  }
}

export function updateRoadmap(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    message: "Roadmap updated successfully."
  });
}