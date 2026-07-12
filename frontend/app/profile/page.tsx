"use client";

import { useEffect, useState, useMemo } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { 
  User, 
  Settings, 
  Code, 
  Languages, 
  Award, 
  Sparkles, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Info 
} from "lucide-react";

interface SkillItem {
  name: string;
  level: "Learning" | "Mastered";
}

const AVAILABLE_SKILLS = [
  "JavaScript",
  "TypeScript",
  "HTML/CSS",
  "React",
  "Next.js",
  "Node.js",
  "Databases (SQL/NoSQL)",
  "Git & GitHub",
  "Python",
  "UI/UX Design",
  "Docker",
  "Cloud Computing",
  "Artificial Intelligence",
];

const AVAILABLE_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Japanese",
  "Hindi",
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [careerGoal, setCareerGoal] = useState("Frontend Developer");
  const [currentSkill, setCurrentSkill] = useState("Beginner");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [learningStyle, setLearningStyle] = useState("practical");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [interestsText, setInterestsText] = useState("");

  // Selected Skills & Spoken Languages
  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Fetch initial profile
  useEffect(() => {
    async function loadProfile() {
      const stored = localStorage.getItem("user");
      if (!stored) return;

      const userObj = JSON.parse(stored);
      setEmail(userObj.email);

      try {
        const response = await fetch(`/api/profile?email=${encodeURIComponent(userObj.email)}`);
        if (!response.ok) throw new Error("Could not fetch profile from server.");

        const payload = await response.json();
        if (payload.success && payload.user) {
          const u = payload.user;
          setName(u.name || "");
          setCareerGoal(u.careerGoal || "Frontend Developer");
          setCurrentSkill(u.currentSkill || "Beginner");
          setWeeklyHours(u.weeklyHours || 5);
          setLearningStyle(u.learningStyle || "practical");
          setPreferredLanguage(u.preferredLanguage || "English");
          setSelectedSkills(u.skills || []);
          setSelectedLanguages(u.languages || []);
          setInterestsText(u.interests ? u.interests.join(", ") : "");
        }
      } catch {
        // Fallback to local storage if server has issue
        setName(userObj.name || "");
        setCareerGoal(userObj.careerGoal || "Frontend Developer");
        setCurrentSkill(userObj.currentSkill || "Beginner");
        setWeeklyHours(userObj.weeklyHours || 5);
        setLearningStyle(userObj.learningStyle || "practical");
        setPreferredLanguage(userObj.preferredLanguage || "English");
        setSelectedSkills(userObj.skills || []);
        setSelectedLanguages(userObj.languages || []);
        setInterestsText(userObj.interests ? userObj.interests.join(", ") : "");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Compute Skill Score dynamically
  // Formula: Base 35 + Sum(skills: Learning = 5, Mastered = 15) + Sum(languages: 5)
  // Capped at 100
  const computedSkillScore = useMemo(() => {
    let score = 35;
    
    selectedSkills.forEach((s) => {
      if (s.level === "Mastered") {
        score += 15;
      } else if (s.level === "Learning") {
        score += 5;
      }
    });

    selectedLanguages.forEach(() => {
      score += 5;
    });

    return Math.min(100, score);
  }, [selectedSkills, selectedLanguages]);

  // Handle skill change
  const handleSkillLevelChange = (skillName: string, level: "None" | "Learning" | "Mastered") => {
    setSelectedSkills((prev) => {
      const filtered = prev.filter((s) => s.name !== skillName);
      if (level === "None") return filtered;
      return [...filtered, { name: skillName, level }];
    });
  };

  // Toggle language selection
  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(lang)) {
        return prev.filter((l) => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  const getSkillLevel = (skillName: string): "None" | "Learning" | "Mastered" => {
    const found = selectedSkills.find((s) => s.name === skillName);
    return found ? found.level : "None";
  };

  // Save profile
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const interestsArray = interestsText
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const updatePayload = {
      skills: selectedSkills,
      languages: selectedLanguages,
      skillScore: computedSkillScore,
      name,
      careerGoal,
      currentSkill,
      weeklyHours: Number(weeklyHours),
      learningStyle,
      preferredLanguage,
      interests: interestsArray,
    };

    try {
      const response = await fetch(`/api/profile?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Failed to update profile.");

      if (payload.success && payload.user) {
        // Sync local storage user
        localStorage.setItem("user", JSON.stringify(payload.user));
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex h-[80vh] w-full items-center justify-center text-white">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-sm font-medium text-slate-400">Loading your profile data...</span>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">User Account</p>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Manage Profile</h1>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/10 transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* Message Panels */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {success}
          </div>
        )}

        {/* Profile Content Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Column 1: Live Score Card & General Settings */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Live Score Circle */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-xl shadow-black/20 overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-cyan-400/10 blur-xl pointer-events-none" />
              
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Adaptive Skill Score</p>
              
              <div className="relative mx-auto mt-6 flex h-40 w-40 items-center justify-center">
                {/* Score Progress Ring */}
                <svg className="absolute h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-white/10"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-cyan-400 transition-all duration-500"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * computedSkillScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-white">{computedSkillScore}</span>
                  <span className="text-slate-400 text-sm block">/ 100</span>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-slate-400">
                Determine your score by selecting starting skills and spoken languages. Update them as you grow!
              </p>

              <div className="mt-4 flex items-center gap-1.5 justify-center rounded-xl bg-cyan-950/40 p-2.5 text-xs text-cyan-200 border border-cyan-800/30">
                <Info className="h-3.5 w-3.5" />
                Score syncs dynamically on the dashboard!
              </div>
            </div>

            {/* General Preferences Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-cyan-400" /> Preferences
              </h2>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">Name</span>
                  <input
                    type="text"
                    className="input-style"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">Career Goal</span>
                  <select
                    className="input-style"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-400">Skill Level</span>
                    <select
                      className="input-style"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-400">Weekly Hours</span>
                    <input
                      type="number"
                      min={1}
                      className="input-style"
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">Learning Style</span>
                  <input
                    type="text"
                    className="input-style"
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    placeholder="practical, video, reading"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">Interests (comma separated)</span>
                  <input
                    type="text"
                    className="input-style"
                    value={interestsText}
                    onChange={(e) => setInterestsText(e.target.value)}
                    placeholder="React, CSS, Algorithms"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Columns 2 & 3: Skills & Languages selections */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Skills selection */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                <Code className="h-5 w-5 text-cyan-400" /> Technology Skills
              </h2>
              <p className="text-slate-400 text-xs mb-6">
                Mark your proficiency in technologies to increase your skill score (Learning = <b>+5</b>, Mastered = <b>+15</b>).
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {AVAILABLE_SKILLS.map((skill) => {
                  const level = getSkillLevel(skill);
                  return (
                    <div 
                      key={skill}
                      className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        level === "Mastered"
                          ? "border-cyan-500/30 bg-cyan-500/5 shadow-md shadow-cyan-500/5"
                          : level === "Learning"
                          ? "border-cyan-500/20 bg-slate-900/60"
                          : "border-white/5 bg-slate-950/60"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-semibold text-white">{skill}</span>
                        {level === "Mastered" && (
                          <Award className="h-4.5 w-4.5 text-cyan-400" />
                        )}
                        {level === "Learning" && (
                          <Sparkles className="h-4.5 w-4.5 text-blue-400" />
                        )}
                      </div>

                      <div className="flex rounded-xl bg-slate-950 border border-white/5 p-1 select-none">
                        {(["None", "Learning", "Mastered"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSkillLevelChange(skill, opt)}
                            className={`flex-1 rounded-lg py-1.5 text-xxs font-semibold transition-all ${
                              level === opt
                                ? "bg-cyan-500 text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spoken Languages selection */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                <Languages className="h-5 w-5 text-cyan-400" /> Languages
              </h2>
              <p className="text-slate-400 text-xs mb-6">
                Select your preferred languages (each spoken language adds <b>+5</b> points to your overall skill score).
              </p>

              <div className="flex flex-wrap gap-3">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        isSelected
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-400 animate-scale" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>

      <style jsx global>{`
        .input-style {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(2, 6, 23, 0.6);
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
          color: white;
          outline: none;
        }
        .input-style:focus {
          border-color: rgba(34, 211, 238, 0.6);
        }
        select.input-style option {
          color: black;
        }
        .text-xxs {
          font-size: 0.7rem;
        }
      `}</style>
    </SidebarLayout>
  );
}
