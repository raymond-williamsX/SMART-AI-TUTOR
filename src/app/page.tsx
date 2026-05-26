"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, CheckCircle2, FileText, Mic, PlayCircle, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI tutoring", description: "Ask anything and get clear, structured explanations tailored to your pace." },
  { icon: UploadCloud, title: "PDF learning", description: "Upload study material and turn dense documents into guided lessons." },
  { icon: FileText, title: "Smart notes", description: "Generate summaries, study sheets, and revision prompts from each session." },
  { icon: ShieldCheck, title: "Session memory", description: "Continue where you left off with persistent, resumable study flows." },
  { icon: Mic, title: "Voice-ready tutoring", description: "Built to expand into natural voice-guided study sessions." },
  { icon: BookOpen, title: "Study plans", description: "Create personalized study paths for exams, assignments, and skill-building." },
];

const steps = [
  { title: "Upload or ask", body: "Drop in a document or start with a question. EduAgent adapts instantly." },
  { title: "Learn interactively", body: "Get explanations, examples, quizzes, and follow-up guidance in one flow." },
  { title: "Continue anytime", body: "Pick up your progress from any device with session persistence." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-[-12%] top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-[-15%] left-1/3 h-96 w-96 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 pb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950 shadow-lg shadow-cyan-400/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold tracking-wide text-white">EduAgent AI</p>
              <p className="text-xs text-slate-400">Your personal AI tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="shadow-[0_16px_40px_rgba(34,211,238,0.18)]">
              <Link href="/signup">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-8">
            <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Premium AI tutoring SaaS</Badge>
            <div className="space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-white text-balance sm:text-6xl"
              >
                Your personal AI tutor that actually teaches.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
              >
                Ask questions, upload study material, build smart revision plans, and keep every learning session organized in one premium workspace.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="flex flex-wrap gap-3"
            >
              <Button asChild size="lg" className="shadow-[0_20px_60px_rgba(34,211,238,0.22)]">
                <Link href="/chat">
                  Start studying
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                <Link href="#how-it-works">
                  <PlayCircle className="h-4 w-4" />
                  See how it works
                </Link>
              </Button>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["24/7", "AI study support"],
                ["PDF + chat", "Document tutoring"],
                ["Supabase", "Saved sessions"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-glow">
                  <p className="font-heading text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
            <Card className="relative overflow-hidden border-white/10 bg-white/[0.04] shadow-2xl shadow-slate-950/50">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Live tutor</p>
                    <p className="mt-1 text-sm font-medium text-white">Study session active</p>
                  </div>
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">Gemini powered</div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4">
                  <div className="space-y-3 text-sm leading-7 text-slate-300">
                    <p><span className="text-cyan-200">You:</span> Explain photosynthesis simply.</p>
                    <p><span className="text-cyan-200">EduAgent:</span> Plants use sunlight, water, and carbon dioxide to make sugar, like a solar-powered kitchen.</p>
                    <p><span className="text-cyan-200">You:</span> Give me a 7-day revision plan.</p>
                    <p><span className="text-cyan-200">EduAgent:</span> Absolutely. I’ll break it into daily concepts, practice, and review loops.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Smart session memory",
                    "Voice-ready tutoring",
                    "Real-time explanations",
                    "Multi-device sync",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Features</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-white">Everything a premium tutor should feel like.</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-white/10 bg-white/[0.04] shadow-glow">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">How it works</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-white">A simple flow designed for momentum, not friction.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="border-white/10 bg-white/[0.04] shadow-glow">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">0{index + 1}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] shadow-2xl shadow-slate-950/50">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr] lg:gap-8 lg:p-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Premium showcase</p>
              <h2 className="font-heading text-3xl font-semibold text-white">Designed like a funded AI product, not a school project.</h2>
              <p className="max-w-xl text-sm leading-7 text-slate-400">
                Clean typography, glass layers, cyan glows, and responsive surfaces all tuned for a high-end tutoring experience.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Immersive chat workspace",
                "Adaptive dashboard shell",
                "Saved study sessions",
                "Upload-driven tutoring",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-white/10 bg-white/[0.04] shadow-glow">
          <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Student outcomes</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold text-white">Realistic tutoring moments that feel personal.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                From homework rescue to exam prep, EduAgent AI keeps the interaction focused, encouraging, and concrete.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
              {[
                "I finally understood algebra in one session.",
                "The study plan kept me on track all week.",
                "I could revisit the same lesson on my phone later.",
              ].map((quote) => (
                <div key={quote} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-7 text-slate-300">
                  “{quote}”
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="border-cyan-300/15 bg-gradient-to-r from-cyan-300/10 to-sky-400/5 shadow-[0_24px_80px_rgba(34,211,238,0.12)]">
          <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100">Ready to learn?</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold text-white">Start a study session in seconds.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-[0_20px_60px_rgba(34,211,238,0.22)]">
                <Link href="/chat">Open chat</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-4 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>EduAgent AI · Premium tutoring SaaS</p>
          <p>Gemini · ElasticSearch · Supabase Auth · Vercel</p>
        </div>
      </footer>
    </main>
  );
}
