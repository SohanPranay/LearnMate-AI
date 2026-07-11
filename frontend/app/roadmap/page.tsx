"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ClipboardList, Loader2, Target } from "lucide-react";

const CAREER_GOALS = [
  "Frontend Developer",
  "Backend Developer",
  "Cybersecurity",
  "AI Engineer",
  "Data Science",
];

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

interface WeeklyPlanItem {
  week: number;
  topic: string;
  description: string;
  resources: string[];
  project: string;
  quiz: string;
}

interface RoadmapData {
  title: string;
  estimatedDuration: string;
  weeklyPlan: WeeklyPlanItem[];
  skills: string[];
  recommendedCourses: string[];
  milestones: string[];
}

export default function RoadmapPage() {
  const [careerGoal, setCareerGoal] = useState(CAREER_GOALS[0]);
  const [currentSkill, setCurrentSkill] = useState<SkillLevel>("Beginner");
  const [weeklyHours, setWeeklyHours] = useState(5);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRoadmap() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          careerGoal,
          currentSkill,
          weeklyHours: String(weeklyHours),
        });

        const response = await fetch(`/api/roadmap?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to load roadmap.");

        const payload = await response.json();
        if (!payload?.data) throw new Error("Roadmap data missing.");

        setRoadmap(payload.data as RoadmapData);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") return;
        setError(
          fetchError instanceof Error ? fetchError.message : "Unexpected error."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRoadmap();
    return () => controller.abort();
  }, [careerGoal, currentSkill, weeklyHours]);

  return (
    <SidebarLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">LearnMate AI</p>
            <h1 className="text-2xl font-semibold text-white">Learning Roadmap</h1>
          </div>
        </div>

        <div className="mb-6 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 sm:grid-cols-3">
          <Select label="Career Goal" value={careerGoal} onChange={setCareerGoal}>
            {CAREER_GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          <Select label="Skill Level" value={currentSkill} onChange={(v) => setCurrentSkill(v as SkillLevel)}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </Select>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Weekly Hours</span>
            <input
              type="number"
              min={1}
              className="input"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
            />
          </label>
        </div>

        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating your roadmap...
          </p>
        )}
        {error && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {!loading && !error && roadmap && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">{roadmap.title}</h2>
              <p className="mt-1 text-sm text-slate-400">
                Estimated duration: {roadmap.estimatedDuration}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-cyan-200">
                  <ClipboardList className="h-5 w-5" /> Weekly Plan
                </p>
                {roadmap.weeklyPlan.map((item) => (
                  <div
                    key={`${item.week}-${item.topic}`}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">
                      Week {item.week}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{item.topic}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p className="text-xs text-slate-400">Project: {item.project}</p>
                      <p className="text-xs text-slate-400">Quiz: {item.quiz}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="mb-2 text-sm font-medium text-slate-300">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="mb-2 text-sm font-medium text-slate-300">Milestones</p>
                  <ul className="space-y-1 text-sm text-slate-200">
                    {roadmap.milestones.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="mb-2 text-sm font-medium text-slate-300">Courses</p>
                  <ul className="space-y-1 text-sm text-slate-200">
                    {roadmap.recommendedCourses.map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(2, 6, 23, 0.6);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        .input:focus {
          border-color: rgba(34, 211, 238, 0.6);
        }
        select.input option {
          color: black;
        }
      `}</style>
    </SidebarLayout>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}
