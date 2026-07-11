"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  Target,
  BookOpen,
  ClipboardList,
  Bot,
  Menu,
  X,
} from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Assessment", icon: BrainCircuit, href: "/assessment" },
  { label: "Roadmap", icon: Target, href: "/roadmap" },
  { label: "AI Mentor", icon: Bot, href: "/mentor" },
  { label: "Courses", icon: BookOpen, href: "/courses" },
  { label: "Tasks", icon: ClipboardList, href: "/tasks" },
];

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(to_bottom,_#020617,_#020617,_#000000)] text-white">
      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[86%] max-w-sm border-r border-white/10 bg-slate-950/95 p-5 backdrop-blur-xl transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
                LM
              </div>
              <div>
                <p className="text-lg font-semibold text-white">LearnMate AI</p>
                <p className="text-xs text-slate-400">Navigation</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-950/70 px-5 py-6 backdrop-blur-xl lg:flex shrink-0">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
            LM
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">LearnMate AI</p>
            <p className="text-xs text-slate-400">Adaptive learning dashboard</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-slate-950">
                LM
              </div>
              <span className="text-sm font-semibold">LearnMate AI</span>
            </div>
            <div className="w-11 h-11" /> {/* Spacer */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
