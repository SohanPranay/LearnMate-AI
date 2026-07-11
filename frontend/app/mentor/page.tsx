"use client";

import { useEffect, useRef, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Bot, Loader2, Send, User } from "lucide-react";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

interface ChatMessage {
  role: "user" | "mentor";
  question?: string;
  answer?: string;
  tips?: string[];
  resources?: string[];
  nextAction?: string;
}

const MODULES = ["JavaScript", "React", "Next.js", "System Design", "Data Structures"];

export default function MentorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [currentModule, setCurrentModule] = useState(MODULES[0]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("Beginner");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;

    const historyPayload = messages.map((msg) => ({
      role: msg.role,
      text: msg.role === "user" ? msg.question : msg.answer,
    }));

    setMessages((prev) => [...prev, { role: "user", question: text }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          currentModule,
          skillLevel,
          history: historyPayload,
        }),
      });

      const payload = await response.json();
      const data = payload?.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "mentor",
          answer: data?.answer || "Sorry, I could not respond right now.",
          tips: data?.tips || [],
          resources: data?.resources || [],
          nextAction: data?.nextAction || "",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "mentor", answer: "Mentor is unavailable right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarLayout>
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6 h-[calc(100vh-64px)] lg:h-screen">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">LearnMate AI</p>
            <h1 className="text-2xl font-semibold text-white">AI Mentor</h1>
          </div>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 shrink-0">
          <select
            className="input"
            value={currentModule}
            onChange={(e) => setCurrentModule(e.target.value)}
          >
            {MODULES.map((m) => (
              <option key={m} value={m}>
                Module: {m}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
          >
            <option value="Beginner">Level: Beginner</option>
            <option value="Intermediate">Level: Intermediate</option>
            <option value="Advanced">Level: Advanced</option>
          </select>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-5 min-h-0">
          {messages.length === 0 && (
            <p className="text-sm text-slate-400">
              Ask the mentor anything about {currentModule}. Powered by IBM Granite.
            </p>
          )}

          {messages.map((msg, index) =>
            msg.role === "user" ? (
              <div key={index} className="flex justify-end gap-3">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-cyan-500/20 to-blue-500/20 px-4 py-3 text-sm">
                  {msg.question}
                </div>
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <User className="h-4 w-4" />
                </div>
              </div>
            ) : (
              <div key={index} className="flex justify-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3 text-sm">
                  <p className="leading-6 text-slate-100">{msg.answer}</p>
                  {msg.tips && msg.tips.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-cyan-200">Tips</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-300">
                        {msg.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {msg.resources && msg.resources.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-cyan-200">Resources</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-300">
                        {msg.resources.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {msg.nextAction && (
                    <p className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
                      Next: {msg.nextAction}
                    </p>
                  )}
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex justify-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex items-center gap-3 shrink-0 pb-4">
          <input
            className="input flex-1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask about ${currentModule}...`}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 transition hover:opacity-90 disabled:opacity-60"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
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
