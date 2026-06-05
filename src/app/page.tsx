"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Brain, CheckCircle2, FileText, Mic, ShieldCheck, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

const features = [
  { icon: Brain, title: "AI tutoring", description: "Ask anything and get clear, structured explanations tailored to your pace." },
  { icon: UploadCloud, title: "PDF learning", description: "Upload study material and turn dense documents into guided lessons." },
  { icon: FileText, title: "Smart notes", description: "Generate summaries, study sheets, and revision prompts from each session." },
  { icon: ShieldCheck, title: "Session memory", description: "Continue where you left off with persistent, resumable study flows." },
  { icon: Mic, title: "Voice-ready tutoring", description: "Built to expand into natural voice-guided study sessions." },
  { icon: BookOpen, title: "Study plans", description: "Create personalized study paths for exams, assignments, and skill-building." },
];

export default function HomePage() {
  const [activeModal, setActiveModal] = useState<"login" | "signup" | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login") setActiveModal("login");
    if (auth === "signup") setActiveModal("signup");
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-cyan-500/30 font-body">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 rounded-2xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl mix-blend-plus-lighter shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-black">
              <Brain className="h-6 w-6" />
            </div>
            <span className="font-heading font-semibold text-white tracking-tight text-xl">EduAgent</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-slate-300 hover:text-white font-medium transition-colors text-base">How it works</Link>
            <Link href="#features" className="text-slate-300 hover:text-white font-medium transition-colors text-base">Features</Link>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 ml-4">
              <button onClick={() => setActiveModal("login")} className="text-slate-300 hover:text-white font-medium transition-colors text-base">Sign in</button>
              <Button onClick={() => setActiveModal("signup")} className="bg-white text-black hover:bg-slate-200 rounded-full px-6 h-11 text-base font-medium">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-48 pb-20 text-center">
        <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-8 text-balance">
          Learn <span className="text-cyan-400">smarter</span>, not harder.
        </h1>
        <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-slate-400 mb-12 text-balance leading-relaxed">
          Ask questions, upload study material, build smart revision plans, and keep every learning session organized in one workspace. No fluff, just results.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Button onClick={() => setActiveModal("signup")} className="bg-white text-black hover:bg-slate-200 rounded-full px-10 h-14 text-lg font-medium w-full sm:w-auto">
            Start studying <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" className="border-white/10 bg-[#141414] hover:bg-[#1f1f1f] text-white rounded-full px-10 h-14 text-lg font-medium w-full sm:w-auto transition-colors">
            Read docs
          </Button>
        </div>
        
        {/* Dashboard Image Mockup */}
        <div className="relative mx-auto max-w-5xl rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
           <Image
             src="/dashboard-mockup.png"
             alt="EduAgent Dashboard"
             width={2048}
             height={1366}
             className="w-full h-auto object-cover"
             priority
           />
        </div>
      </section>

      {/* Core Principles */}
      <section id="how-it-works" className="border-t border-white/5 bg-[#0a0a0a] py-32">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-heading text-5xl sm:text-6xl font-medium text-white leading-tight mb-8">
              Study sessions should be intuitive, fast, and structured.
            </h2>
            <p className="text-2xl text-slate-400 leading-relaxed pl-8 border-l-2 border-cyan-500/30">
              EduAgent gives you scalable learning without the friction. Just upload and start conversing.
            </p>
          </div>
          
          <div className="grid gap-8">
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-10 hover:border-cyan-500/30 transition-colors">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-medium text-white mb-4">Document learning</h3>
              <p className="text-slate-400 text-xl leading-relaxed">Stable, fast parsing for your lecture slides and PDF notes.</p>
            </div>
            
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-10 hover:border-cyan-500/30 transition-colors">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-medium text-white mb-4">Structured guidance</h3>
              <p className="text-slate-400 text-xl leading-relaxed">Clear answers, quizzes, and follow-ups. No rambling AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32 border-t border-white/5">
        <div className="mb-20 text-center sm:text-left">
          <h2 className="font-heading text-4xl sm:text-5xl font-medium text-white">Everything a premium tutor should feel like.</h2>
        </div>
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-transparent group p-2">
                <div className="mb-6 text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-32 border-t border-white/5 text-center">
        <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white mb-8 text-balance">
          Ready to ace it?
        </h2>
        <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-slate-400 mb-12 text-balance leading-relaxed">
          Join today and experience the most intuitive AI tutoring platform built for actual studying.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={() => setActiveModal("signup")} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-full px-10 h-14 text-lg font-medium w-full sm:w-auto">
            Get started for free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 text-base">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-cyan-500" />
            <span className="font-heading font-medium text-white text-lg">EduAgent</span>
          </div>
          <div className="text-slate-500 max-w-md text-lg">
            Upload, read, and learn from one workspace without managing scattered files, lost prompts, or context windows.
          </div>
          <div className="flex gap-8 text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 mt-16 text-slate-600 text-sm">
          © {new Date().getFullYear()} EduAgent AI. All rights reserved.
        </div>
      </footer>

      {/* Auth Modals */}
      <Modal isOpen={activeModal === "login"} onClose={() => setActiveModal(null)}>
        <LoginForm 
          onSwitchToSignup={() => setActiveModal("signup")} 
          redirectTo="/chat" 
        />
      </Modal>

      <Modal isOpen={activeModal === "signup"} onClose={() => setActiveModal(null)}>
        <SignupForm 
          onSwitchToLogin={() => setActiveModal("login")} 
          redirectTo="/chat" 
        />
      </Modal>
    </main>
  );
}
