"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { BookOpen, CheckCircle2, Play, ExternalLink, Sparkles, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  status: "Not Started" | "In Progress" | "Completed";
  link: string;
}

const COURSE_CATALOG: Record<string, Omit<Course, "id" | "status">> = {
  // Frontend Developer
  "Modern React with TypeScript": {
    title: "Modern React with TypeScript",
    provider: "IBM SkillsBuild",
    duration: "14 hours",
    level: "Intermediate",
    link: "https://www.coursera.org/learn/developing-frontend-apps-with-react",
  },
  "Advanced CSS for Scalable Design Systems": {
    title: "Advanced CSS & Responsive Design Systems",
    provider: "MDN Academy",
    duration: "8 hours",
    level: "Intermediate",
    link: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
  },
  "Next.js for Production Applications": {
    title: "Next.js for Production Applications",
    provider: "Vercel Academy",
    duration: "12 hours",
    level: "Advanced",
    link: "https://nextjs.org/learn/dashboard-app",
  },

  // Backend Developer
  "Backend Engineering with Node.js": {
    title: "Backend Engineering with Node.js",
    provider: "freeCodeCamp",
    duration: "18 hours",
    level: "Intermediate",
    link: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
  },
  "Database Design for Production": {
    title: "Database Design for Production",
    provider: "Prisma Academy",
    duration: "10 hours",
    level: "Intermediate",
    link: "https://www.prisma.io/dataguide",
  },
  "Scalable System Design Fundamentals": {
    title: "Scalable System Design Fundamentals",
    provider: "Github Primer",
    duration: "15 hours",
    level: "Advanced",
    link: "https://github.com/donnemartin/system-design-primer",
  },

  // Cybersecurity
  "Practical Web Security": {
    title: "Practical Web Security",
    provider: "OWASP Foundation",
    duration: "12 hours",
    level: "Intermediate",
    link: "https://owasp.org/www-project-top-ten/",
  },
  "Cloud Security Essentials": {
    title: "Cloud Security Essentials",
    provider: "Cloudflare learning",
    duration: "8 hours",
    level: "Beginner",
    link: "https://www.cloudflare.com/learning/cloud/what-is-cloud-security/",
  },
  "Incident Response and Detection Engineering": {
    title: "Incident Response & Detection",
    provider: "CISA Cybersecurity",
    duration: "14 hours",
    level: "Advanced",
    link: "https://www.cisa.gov/resources-tools/services",
  },

  // AI Engineer
  "Machine Learning Engineering in Practice": {
    title: "Machine Learning in Practice",
    provider: "Coursera IBM",
    duration: "20 hours",
    level: "Intermediate",
    link: "https://www.coursera.org/learn/machine-learning",
  },
  "LLM Application Development": {
    title: "LLM Application Development",
    provider: "DeepLearning.AI",
    duration: "6 hours",
    level: "Advanced",
    link: "https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/",
  },
  "MLOps for Production AI Systems": {
    title: "MLOps for Production AI Systems",
    provider: "Coursera deeplearning.ai",
    duration: "16 hours",
    level: "Advanced",
    link: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops",
  },

  // Data Science
  "Applied Data Science with Python": {
    title: "Applied Data Science with Python",
    provider: "Coursera IBM",
    duration: "24 hours",
    level: "Intermediate",
    link: "https://www.coursera.org/specializations/data-science-python",
  },
  "SQL for Analytics": {
    title: "SQL for Analytics",
    provider: "freeCodeCamp",
    duration: "10 hours",
    level: "Beginner",
    link: "https://www.freecodecamp.org/learn/relational-database/",
  },
  "Experimentation and Causal Inference": {
    title: "Experimentation & Causal Inference",
    provider: "Udacity",
    duration: "12 hours",
    level: "Advanced",
    link: "https://www.udacity.com/course/ab-testing--ud257",
  }
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/roadmap");
        if (!res.ok) throw new Error("Failed to fetch active roadmap.");
        const payload = await res.json();
        const recommended: string[] = payload?.data?.recommendedCourses || [];
        
        const mappedCourses: Course[] = recommended.map((name, index) => {
          const catalogItem = COURSE_CATALOG[name] || {
            title: name,
            provider: "IBM SkillsBuild",
            duration: "10 hours",
            level: "Intermediate",
            link: "https://skillsbuild.org",
          };
          return {
            id: `c-${index}`,
            ...catalogItem,
            status: index === 0 ? "In Progress" : "Not Started"
          };
        });

        setCourses(mappedCourses);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  function toggleStatus(id: string) {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextStatus =
          c.status === "Not Started"
            ? "In Progress"
            : c.status === "In Progress"
            ? "Completed"
            : "Not Started";
        return { ...c, status: nextStatus };
      })
    );
  }

  return (
    <SidebarLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">LearnMate AI</p>
            <h1 className="text-2xl font-semibold text-white">Recommended Courses</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-300 py-10">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            Loading courses tailored to your career goal...
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/8 hover:shadow-xl hover:shadow-cyan-500/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-slate-300">
                      {course.provider}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        course.status === "Completed"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : course.status === "In Progress"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold leading-6 text-white group-hover:text-cyan-300 transition-colors">
                    {course.title}
                  </h3>

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                    <p>Duration: {course.duration}</p>
                    <p>Level: {course.level}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Study
                  </a>
                  <button
                    onClick={() => toggleStatus(course.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    {course.status === "Completed" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Restart
                      </>
                    ) : course.status === "In Progress" ? (
                      <>
                        <Play className="h-3.5 w-3.5 animate-pulse" />
                        Complete
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Start
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <p className="text-sm text-slate-400 py-6">No courses recommended for this profile yet.</p>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
