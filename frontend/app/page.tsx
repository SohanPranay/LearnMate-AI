"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import {
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

type CurrentSkill = "Beginner" | "Intermediate" | "Advanced";

interface StudentData {
  name: string;
  careerGoal: string;
  currentSkill: CurrentSkill;
  weeklyHours: number;
  learningStyle: string;
  preferredLanguage: string;
  interests: string[];
}

interface AssessmentData {
  student?: StudentData;
  skillScore: number;
  difficulty: CurrentSkill;
  knowledgeGaps: string[];
  strengths: string[];
  estimatedDuration: string;
}

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

function DashboardCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {icon}
      </div>
      {children}
    </section>
  );
}

function LoadingPanel() {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading dashboard data...
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      <AlertTriangle className="mt-0.5 h-4 w-4" />
      {message}
    </div>
  );
}

interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      try {
        const [assessmentResponse, roadmapResponse] = await Promise.all([
          fetch(`/api/assessment`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          }),
          fetch(`/api/roadmap`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          }),
        ]);

        if (!assessmentResponse.ok || !roadmapResponse.ok) {
          throw new Error("Unable to fetch dashboard data from backend APIs.");
        }

        const assessmentPayload = await assessmentResponse.json();
        const roadmapPayload = await roadmapResponse.json();

        const assessmentData: AssessmentData | null = assessmentPayload?.data ?? null;
        const roadmapData: RoadmapData | null = roadmapPayload?.data ?? null;

        if (!assessmentData || !roadmapData) {
          throw new Error("Backend response is missing expected assessment or roadmap data.");
        }

        setAssessment(assessmentData);
        setRoadmap(roadmapData);

        // Load or initialize tasks for the selected stream
        const careerGoal = assessmentData.student?.careerGoal || "Frontend Developer";
        const localTasksKey = `tasks_${careerGoal}`;
        const savedTasks = localStorage.getItem(localTasksKey);
        
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          const weeklyPlan = roadmapData.weeklyPlan || [];
          const mappedTasks: Task[] = [];
          weeklyPlan.forEach((w: WeeklyPlanItem, index: number) => {
            mappedTasks.push({
              id: `t-topic-${index}`,
              text: `Week ${w.week}: Master ${w.topic}`,
              category: "Roadmap",
              completed: false
            });
            mappedTasks.push({
              id: `t-proj-${index}`,
              text: `Week ${w.week} Project: ${w.project}`,
              category: "Project",
              completed: false
            });
            mappedTasks.push({
              id: `t-quiz-${index}`,
              text: `Week ${w.week} Quiz: ${w.quiz}`,
              category: "Quiz",
              completed: false
            });
          });
          setTasks(mappedTasks);
          localStorage.setItem(localTasksKey, JSON.stringify(mappedTasks));
        }
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unexpected error while loading dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();

    return () => controller.abort();
  }, []);

  const progressPercent = useMemo(() => {
    if (tasks.length === 0) {
      return 0;
    }
    const completedCount = tasks.filter((t) => t.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  }, [tasks]);

  const dynamicSkillScore = useMemo(() => {
    if (!assessment) return 35;
    const baseScore = assessment.skillScore || 35;
    const remainingScore = 100 - baseScore;
    return baseScore + Math.round((progressPercent / 100) * remainingScore);
  }, [assessment, progressPercent]);

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">LearnMate AI</p>
          <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Personalized Dashboard</h1>
        </div>

        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            fetch(`/api/assessment`, { method: "GET" })
              .then(res => res.json())
              .then(payload => {
                const assessmentData = payload.data;
                setAssessment(assessmentData);
                return fetch(`/api/roadmap`, { method: "GET" })
                  .then(res => res.json())
                  .then(roadmapPayload => {
                    const roadmapData = roadmapPayload.data;
                    setRoadmap(roadmapData);

                    // Load tasks from localStorage for the refreshed careerGoal
                    const careerGoal = assessmentData?.student?.careerGoal || "Frontend Developer";
                    const localTasksKey = `tasks_${careerGoal}`;
                    const savedTasks = localStorage.getItem(localTasksKey);
                    if (savedTasks) {
                      setTasks(JSON.parse(savedTasks));
                    } else {
                      const weeklyPlan = roadmapData?.weeklyPlan || [];
                      const mappedTasks: Task[] = [];
                      weeklyPlan.forEach((w: WeeklyPlanItem, index: number) => {
                        mappedTasks.push({
                          id: `t-topic-${index}`,
                          text: `Week ${w.week}: Master ${w.topic}`,
                          category: "Roadmap",
                          completed: false
                        });
                        mappedTasks.push({
                          id: `t-proj-${index}`,
                          text: `Week ${w.week} Project: ${w.project}`,
                          category: "Project",
                          completed: false
                        });
                        mappedTasks.push({
                          id: `t-quiz-${index}`,
                          text: `Week ${w.week} Quiz: ${w.quiz}`,
                          category: "Quiz",
                          completed: false
                        });
                      });
                      setTasks(mappedTasks);
                      localStorage.setItem(localTasksKey, JSON.stringify(mappedTasks));
                    }
                  });
              })
              .catch(() => {
                setError("Failed to refresh data.");
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          Refresh
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {loading && <LoadingPanel />}
          {error && <ErrorPanel message={error} />}

          {!loading && !error && assessment && roadmap && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DashboardCard title="Skill Score" icon={<TrendingUp className="h-5 w-5 text-cyan-300" />}>
                  <p className="text-4xl font-semibold tracking-tight text-white">{dynamicSkillScore}</p>
                  <p className="mt-2 text-sm text-slate-400">Difficulty: {assessment.difficulty}</p>
                </DashboardCard>

                <DashboardCard title="Estimated Duration" icon={<Target className="h-5 w-5 text-cyan-300" />}>
                  <p className="text-3xl font-semibold tracking-tight text-white">{roadmap.estimatedDuration}</p>
                  <p className="mt-2 text-sm text-slate-400">{roadmap.title}</p>
                </DashboardCard>

                <DashboardCard title="Progress" icon={<Sparkles className="h-5 w-5 text-cyan-300" />}>
                  <p className="text-3xl font-semibold tracking-tight text-white">{progressPercent}%</p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </DashboardCard>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <DashboardCard title="Knowledge Gaps" icon={<BrainCircuit className="h-5 w-5 text-cyan-300" />}>
                  <div className="flex flex-wrap gap-2">
                    {assessment.knowledgeGaps.map((gap) => (
                      <span
                        key={gap}
                        className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </DashboardCard>

                <DashboardCard title="Recommended Courses" icon={<BookOpen className="h-5 w-5 text-cyan-300" />}>
                  <ul className="space-y-2">
                    {roadmap.recommendedCourses.map((course) => (
                      <li key={course} className="flex items-start gap-2 text-sm text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                        {course}
                      </li>
                    ))}
                  </ul>
                </DashboardCard>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <DashboardCard title="Roadmap Timeline" icon={<ClipboardList className="h-5 w-5 text-cyan-300" />}>
                  <div className="space-y-3">
                    {roadmap.weeklyPlan.map((item) => (
                      <div key={`${item.week}-${item.topic}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">Week {item.week}</p>
                            <h3 className="mt-1 text-base font-semibold text-white">{item.topic}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <p className="text-xs text-slate-400">Project: {item.project}</p>
                          <p className="text-xs text-slate-400">Quiz: {item.quiz}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCard>

                <DashboardCard title="Skills Growth" icon={<TrendingUp className="h-5 w-5 text-cyan-300" />}>
                  <div className="space-y-2">
                    {roadmap.skills.map((skill) => (
                      <div key={skill} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                        {skill}
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              </section>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
