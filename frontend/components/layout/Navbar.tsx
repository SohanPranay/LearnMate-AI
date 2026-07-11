"use client";

import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navigationLinks = [
	{ label: "Home", href: "#home" },
	{ label: "Features", href: "#features" },
	{ label: "Roadmap", href: "#roadmap" },
	{ label: "AI Mentor", href: "#ai-mentor" },
	{ label: "About", href: "#about" },
];

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
			<nav className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-slate-950/65 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
				<div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
					<a
						href="#home"
						className="group inline-flex items-center gap-3 text-white transition-transform duration-300 hover:-translate-y-0.5"
					>
						<span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
							LM
						</span>
						<div>
							<p className="text-base font-semibold tracking-tight">LearnMate AI</p>
							<p className="text-xs text-slate-400">Premium learning companion</p>
						</div>
					</a>

					<div className="hidden items-center gap-1 lg:flex">
						{navigationLinks.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/8 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
							>
								{link.label}
							</a>
						))}
					</div>

					<div className="hidden items-center gap-3 lg:flex">
						<a
							href="#login"
							className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
						>
							Login
						</a>
						<a
							href="#get-started"
							className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20"
						>
							Get Started
							<ArrowRight className="h-4 w-4" />
						</a>
					</div>

					<button
						type="button"
						aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						aria-expanded={mobileMenuOpen}
						aria-controls="mobile-navigation"
						onClick={() => setMobileMenuOpen((open) => !open)}
						className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10 lg:hidden"
					>
						{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</button>
				</div>

				<div
					id="mobile-navigation"
					className={`overflow-hidden border-t border-white/10 lg:hidden ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} transition-all duration-300 ease-out`}
				>
					<div className="space-y-2 px-4 py-4 sm:px-6">
						{navigationLinks.map((link) => (
							<a
								key={link.label}
								href={link.href}
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
							>
								{link.label}
								<ArrowRight className="h-4 w-4 text-slate-400" />
							</a>
						))}

						<div className="grid gap-3 pt-2 sm:grid-cols-2">
							<a
								href="#login"
								onClick={() => setMobileMenuOpen(false)}
								className="rounded-full border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-200 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
							>
								Login
							</a>
							<a
								href="#get-started"
								onClick={() => setMobileMenuOpen(false)}
								className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:bg-cyan-300"
							>
								Get Started
								<ArrowRight className="h-4 w-4" />
							</a>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
