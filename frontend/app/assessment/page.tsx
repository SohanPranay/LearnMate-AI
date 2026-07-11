"use client";

import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { BrainCircuit, Loader2, Sparkles, Target } from "lucide-react";

type CurrentSkill = "Beginner" | "Intermediate" | "Advanced";

const CAREER_GOALS = [
  "Frontend Developer",
  "Backend Developer",
  "Cybersecurity",
  "AI Engineer",
  "Data Science",
];

interface AssessmentResult {
  student: {
    name: string;
    careerGoal: string;
    currentSkill: CurrentSkill;
    weeklyHours: number;
    learningStyle: string;
    preferredLanguage: string;
    interests: string[];
  };
  skillScore: number;
  difficulty: CurrentSkill;
  knowledgeGaps: string[];
  strengths: string[];
  estimatedDuration: string;
}

export default function AssessmentPage() {
  const [name, setName] = useState("");
  const [careerGoal, setCareerGoal] = useState(CAREER_GOALS[0]);
  const [currentSkill, setCurrentSkill] = useState<CurrentSkill>("Beginner");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [learningStyle, setLearningStyle] = useState("practical");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [interests, setInterests] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          careerGoal,
          currentSkill,
          weeklyHours: Number(weeklyHours),
          learningStyle,
          preferredLanguage,
          interests: interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Assessment request failed.");
      }

      const payload = await response.json();
      if (!payload?.data) {
        throw new Error("Assessment response was empty.");
      }

      setResult(payload.data as AssessmentResult);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error during assessment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">LearnMate AI</p>
            <h1 className="text-2xl font-semibold text-white">Skill Assessment</h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20"
        >
          <Field label="Name">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </Field>

          <Field label="Career Goal">
            <select
              className="input"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
            >
              {CAREER_GOALS.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Current Skill">
              <select
                className="input"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value as CurrentSkill)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </Field>

            <Field label="Weekly Hours">
              <input
                type="number"
                min={1}
                className="input"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Learning Style">
              <input
                className="input"
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                placeholder="practical"
              />
            </Field>

            <Field label="Preferred Language">
              <input
                className="input"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Interests (comma separated)">
            <input
              className="input"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="web, games, data"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Generate Assessment"}
          </button>
        </form>

        {error && (
          <p className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 text-cyan-200">
              <Target className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-white">Your Assessment</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Skill Score" value={String(result.skillScore)} />
              <Stat label="Difficulty" value={result.difficulty} />
              <Stat label="Est. Duration" value={result.estimatedDuration} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Knowledge Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {result.knowledgeGaps.map((gap) => (
                    <span
                      key={gap}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((strength) => (
                    <span
                      key={strength}
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(2, 6, 23, 0.6);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        :global(.input:focus) {
          border-color: rgba(34, 211, 238, 0.6);
        }
        :global(select.input option) {
          color: black;
        }
      `}</style>
    </SidebarLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
