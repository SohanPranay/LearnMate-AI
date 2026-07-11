import { Request, Response } from "express";
import { mentorReply, HistoryMessage } from "../agents/mentor.agent";
import { callGranite } from "../services/granite.service";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

const VALID_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

function isValidLevel(value: unknown): value is SkillLevel {
  return typeof value === "string" && VALID_LEVELS.includes(value as SkillLevel);
}

export function getChatMessage(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    data: {
      answer: "Hello! I'm MentorAI, powered by IBM Granite. Ask me anything about your learning journey.",
      tips: [
        "Practice every day",
        "Build projects",
        "Revise consistently"
      ],
      resources: [
        "IBM SkillsBuild",
        "MDN Docs",
        "freeCodeCamp"
      ],
      nextAction: "Complete today's roadmap task."
    }
  });
}

export async function sendChatMessage(req: Request, res: Response) {
  try {
    const question = String(req.body?.question || "").trim();
    const currentModule = String(req.body?.currentModule || "this module");
    const skillLevel = isValidLevel(req.body?.skillLevel) ? req.body.skillLevel : "Beginner";
    const history: HistoryMessage[] = req.body?.history || [];

    if (!question) {
      res.status(400).json({
        success: false,
        message: "A 'question' field is required.",
      });
      return;
    }

    const mentor = await mentorReply({ question, currentModule, skillLevel, history });

    let answer = mentor.answer;

    try {
      // Construct conversational context history for Watsonx Granite
      const conversationPrompt = history
        .map((h) => `${h.role === "user" ? "Student" : "Mentor"}: ${h.text}`)
        .join("\n");

      const granitePrompt = [
        "You are MentorAI, a friendly, encouraging, and highly intelligent learning mentor built on IBM Granite.",
        `The student is at a ${skillLevel} level studying ${currentModule}.`,
        "Here is the chat history between the Student and the Mentor:",
        conversationPrompt,
        `Student: ${question}`,
        "Mentor (reply in under 120 words):",
      ].join("\n");

      const granite = await callGranite(granitePrompt);
      if (granite.data.text && granite.data.text.trim()) {
        answer = granite.data.text.trim();
      }
    } catch {
      // Granite/WatsonX unavailable (missing credentials or network) — fall back to offline mentor logic.
    }

    res.status(200).json({
      success: true,
      data: {
        answer,
        tips: mentor.tips,
        resources: mentor.resources,
        nextAction: mentor.nextAction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mentor is unavailable right now.",
    });
  }
}
