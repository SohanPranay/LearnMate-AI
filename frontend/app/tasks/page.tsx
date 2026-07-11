"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ClipboardList, Plus, Trash2, CheckCircle2, Circle, Loader2 } from "lucide-react";

interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Custom");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/roadmap");
        if (!res.ok) throw new Error("Failed to fetch roadmap.");
        const payload = await res.json();
        const weeklyPlan = payload?.data?.weeklyPlan || [];
        
        const mappedTasks: Task[] = [];
        weeklyPlan.forEach((w: any, index: number) => {
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
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: String(Date.now()),
      text: newTaskText.trim(),
      category: newTaskCategory,
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText("");
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <SidebarLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">LearnMate AI</p>
            <h1 className="text-2xl font-semibold text-white">Daily Tasks & Checklist</h1>
          </div>
        </div>

        {/* Progress Card */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Progress Status</h2>
              <p className="text-sm text-slate-400">
                Completed {completedCount} out of {tasks.length} tasks
              </p>
            </div>
            <span className="text-2xl font-bold text-cyan-300">{progressPercent}%</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task Creator Form */}
        <form onSubmit={handleAddTask} className="mb-6 flex gap-3">
          <input
            className="input flex-1"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
          />
          <select
            className="input w-36 shrink-0"
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
          >
            <option value="Roadmap">Roadmap</option>
            <option value="Project">Project</option>
            <option value="Quiz">Quiz</option>
            <option value="Self Study">Self Study</option>
            <option value="Custom">Custom</option>
          </select>
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 transition hover:opacity-90 disabled:opacity-60"
            aria-label="Add task"
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-300 py-10">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            Loading tasks aligned with your roadmap...
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                  task.completed
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-white/10 bg-slate-950/60"
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex flex-1 items-start gap-3 text-left"
                >
                  <span className="mt-0.5 shrink-0 text-cyan-400">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        task.completed ? "text-slate-500 line-through" : "text-white"
                      }`}
                    >
                      {task.text}
                    </p>
                    <span className="mt-1 inline-block rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                      {task.category}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-8">No tasks left! Great job.</p>
            )}
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
