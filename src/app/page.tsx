"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Brain, CheckCircle2, FileText, Mic, ShieldCheck, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

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

function DemoChat({ onTriggerSignup }: { onTriggerSignup: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCTA, setShowCTA] = useState(false);

  const starters = [
    "Explain quantum computing in simple terms",
    "What is the difference between active and passive transport?",
    "Give me a quick analogy for recursive programming",
  ];

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setLoading(true);
    setInput("");
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const res = await fetch("/api/demo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate answer.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setShowCTA(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I'm having trouble connecting to the tutoring engine right now. Please try again or sign up for full access!" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-[#141414]/40 backdrop-blur-md p-6 sm:p-8 text-left shadow-[0_0_50px_rgba(6,182,212,0.05)] mb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Interactive AI Tutor Demo</h3>
          <p className="text-xs text-slate-500 mt-0.5">Test EduAgent's capabilities immediately below.</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 leading-relaxed italic">
            Ask any study question below, or select a starter topic to preview tutoring capabilities instantly.
          </p>
        )}
        {messages.map((msg, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-500/15 border border-cyan-500/20 text-white rounded-br-none"
                  : "bg-white/[0.04] border border-white/5 text-slate-300 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-2.5">
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Starters */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {starters.map((starter) => (
            <button
              key={starter}
              onClick={() => handleSend(starter)}
              disabled={loading}
              className="text-xs text-slate-400 border border-white/10 bg-white/[0.02] rounded-full px-3.5 py-1.5 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-white transition-colors"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Ask a study question... (e.g. How does DNA replicate?)"
          disabled={loading}
          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          className="h-11 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          Ask
        </button>
      </div>

      {/* CTA Conversion Box */}
      {showCTA && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 border border-cyan-500/25 bg-cyan-500/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Unlock full tutoring powers!</p>
            <p className="text-xs text-cyan-200 mt-1">
              Create persistent study sessions, upload your lecture materials, and generate custom practice quizzes.
            </p>
          </div>
          <button
            onClick={onTriggerSignup}
            className="whitespace-nowrap rounded-xl bg-white hover:bg-slate-200 text-slate-950 px-5 py-2.5 text-xs font-semibold shadow-md transition-all flex items-center gap-1 shrink-0"
          >
            Create free account <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

function HomePageContent() {
  const [activeModal, setActiveModal] = useState<"login" | "signup" | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login") setActiveModal("login");
    if (auth === "signup") setActiveModal("signup");
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-cyan-500/30 font-body overflow-hidden">
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "EduAgent AI",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Experience the most intuitive AI tutoring platform built for actual studying. Ask questions, upload PDFs, and build smart revision plans.",
          }),
        }}
      />
      
      {/* Floating Navigation */}
      <motion.nav 
        initial={{ y: -100, x: "-50%" }}
        animate={{ y: 0, x: "-50%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-6 left-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 rounded-2xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl mix-blend-plus-lighter shadow-2xl"
      >
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
      </motion.nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-48 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-8 text-balance">
            Learn <span className="text-cyan-400">smarter</span>, not harder.
          </h1>
          <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-slate-400 mb-12 text-balance leading-relaxed">
            Ask questions, upload study material, build smart revision plans, and keep every learning session organized in one workspace. No fluff, just results.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
          <Button onClick={() => setActiveModal("signup")} className="bg-white text-black hover:bg-slate-200 rounded-full px-10 h-14 text-lg font-medium w-full sm:w-auto">
            Start studying <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" className="border-white/10 bg-[#141414] hover:bg-[#1f1f1f] text-white rounded-full px-10 h-14 text-lg font-medium w-full sm:w-auto transition-colors">
            Read docs
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <DemoChat onTriggerSignup={() => setActiveModal("signup")} />
        </motion.div>
        
        {/* Dashboard Image Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="relative mx-auto max-w-5xl rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        >
           <Image
             src="/dashboard-mockup.png"
             alt="EduAgent AI Tutoring Dashboard Mockup"
             width={2048}
             height={1366}
             className="w-full h-auto object-cover"
             priority
           />
        </motion.div>
      </section>

      {/* Core Principles */}
      <section id="how-it-works" className="border-t border-white/5 bg-[#0a0a0a] py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="font-heading text-5xl sm:text-6xl font-medium text-white leading-tight mb-8">
              Study sessions should be intuitive, fast, and structured.
            </h2>
            <p className="text-2xl text-slate-400 leading-relaxed pl-8 border-l-2 border-cyan-500/30">
              EduAgent gives you scalable learning without the friction. Just upload and start conversing.
            </p>
          </motion.div>
          
          <div className="grid gap-8">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="bg-[#141414] border border-white/5 rounded-3xl p-10 hover:border-cyan-500/30 transition-colors"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-medium text-white mb-4">Document learning</h3>
              <p className="text-slate-400 text-xl leading-relaxed">Stable, fast parsing for your lecture slides and PDF notes.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="bg-[#141414] border border-white/5 rounded-3xl p-10 hover:border-cyan-500/30 transition-colors"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-medium text-white mb-4">Structured guidance</h3>
              <p className="text-slate-400 text-xl leading-relaxed">Clear answers, quizzes, and follow-ups. No rambling AI.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32 border-t border-white/5 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center sm:text-left"
        >
          <h2 className="font-heading text-4xl sm:text-5xl font-medium text-white">Everything a premium tutor should feel like.</h2>
        </motion.div>
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={feature.title} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-transparent group p-4 rounded-3xl border border-transparent hover:border-white/5 hover:bg-[#141414]/50 transition-all cursor-default"
              >
                <div className="mb-6 text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp CTA Section */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-md p-8 sm:p-10 shadow-[0_0_50px_rgba(16,185,129,0.03)]"
        >
          <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center justify-center text-center gap-6 relative z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.764.456 3.48 1.332 5.004L2 22l5.148-1.344c1.488.816 3.168 1.248 4.86 1.248 5.532 0 10.012-4.48 10.012-10.012A9.97 9.97 0 0012.012 2zm5.796 14.196c-.24.672-1.2 1.224-1.656 1.284-.444.06-1.008.084-2.82-.672-2.316-.96-3.804-3.324-3.924-3.48-.108-.156-.936-1.248-.936-2.376 0-1.128.588-1.68.804-1.908.216-.228.468-.288.624-.288.156 0 .312.008.444.012.144.004.336-.056.528.408.192.48.66 1.608.72 1.728.06.12.096.264.012.432-.084.168-.18.276-.3.42-.12.144-.252.3-.36.408-.12.12-.24.252-.108.48.132.228.588.972 1.26 1.572.864.768 1.596 1.008 1.824 1.116.228.108.36.096.492-.06.132-.156.576-.672.732-.9.156-.228.312-.192.528-.108.216.084 1.38.648 1.62.768.24.12.408.18.468.288.06.108.06.624-.18 1.296z" />
              </svg>
            </div>
            
            <div className="max-w-md">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">Prefer WhatsApp?</h3>
              <p className="text-sm text-slate-400 mt-2">
                Chat with Edu Agent AI directly on WhatsApp. Continue your learning sessions on the go.
              </p>
            </div>

            <Link
              href={process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/15551234567"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-8 h-12 text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.2)]"
            >
              Start WhatsApp Chat
            </Link>
          </div>
        </motion.div>
      </section>

      {/* CTA & Footer Section */}
      <footer className="bg-[#0a0a0a] pt-32">
        <div className="relative overflow-hidden h-[240px] flex justify-center items-center border-y border-white/5">
          <div className="w-[2000px] md:w-[4000px] h-[800px] absolute -top-[720px] left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#0a0a0a] via-[#141414] to-cyan-500/10 rounded-[100%]"></div>
          <div className="w-20 md:w-80 h-10 bg-gradient-to-l from-cyan-500/20 via-cyan-500/10 to-transparent blur-[4.95px] absolute top-1/2 -translate-y-1/2 right-[56%]"></div>
          <div className="w-20 md:w-80 h-10 bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent blur-[4.95px] absolute top-1/2 -translate-y-1/2 left-[56%]"></div>
          <div className="absolute top-1/2 -translate-y-1/2 right-1/2 w-[300px] md:w-[1000px] h-[70px] md:h-[140px] bg-gradient-to-l from-cyan-500/10 via-cyan-500/5 to-transparent blur-[60px] [clip-path:polygon(100%_50%,0_0,0_100%)] pointer-events-none z-0"></div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-[300px] md:w-[1000px] h-[70px] md:h-[140px] bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent blur-[60px] [clip-path:polygon(0_50%,100%_0,100%_100%)] pointer-events-none z-0"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex gap-3 justify-center relative items-center z-10"
          >
            <button 
              onClick={() => setActiveModal("signup")} 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors text-slate-950 py-2 rounded-full h-12 px-8 text-[15px] bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Get started for free
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors text-slate-950 rounded-full w-12 h-12 bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
          <div className="w-[2000px] md:w-[4000px] h-[800px] absolute -bottom-[720px] left-1/2 -translate-x-1/2 rounded-[100%] pointer-events-none bg-gradient-to-t from-[#0a0a0a] via-[#141414] to-cyan-500/10"></div>
        </div>

        <div className="pt-20 pb-8 md:px-6 px-4">
          <div className="container mx-auto space-y-6">
            <div className="flex flex-col justify-between md:flex-row gap-8 md:gap-4">
              <div className="flex flex-col space-y-4 max-w-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="h-10 w-10 text-cyan-500" />
                  <h3 className="text-5xl md:text-6xl font-heading font-medium tracking-tighter text-white leading-none">EduAgent</h3>
                </div>
                <div className="w-full text-slate-400 text-base md:text-lg font-normal">
                  Experience the most intuitive AI tutoring platform built for actual studying.
                </div>
              </div>
              <div className="flex gap-16 md:gap-28 pt-4 md:mr-4">
                <ul className="flex flex-col space-y-5">
                  <li><Link href="#" className="text-slate-400 text-lg font-normal capitalize hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="#how-it-works" className="text-slate-400 text-lg font-normal capitalize hover:text-white transition-colors">How it works</Link></li>
                  <li><Link href="#features" className="text-slate-400 text-lg font-normal capitalize hover:text-white transition-colors">Features</Link></li>
                </ul>
                <ul className="flex flex-col space-y-5">
                  <li><button onClick={() => setActiveModal("login")} className="text-slate-400 text-lg font-normal capitalize hover:text-white transition-colors">Sign in</button></li>
                  <li><button onClick={() => setActiveModal("signup")} className="text-slate-400 text-lg font-normal capitalize hover:text-white transition-colors">Sign up</button></li>
                </ul>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-white/10 mt-12 mb-8"></div>
            
            <div className="flex flex-col md:flex-row justify-between text-[15px] gap-4 text-slate-500 font-medium pb-4">
              <p className="text-sm md:text-base font-normal">Copyright {new Date().getFullYear()} EduAgent AI</p>
              <div className="flex items-center gap-8 md:mr-4">
                <Link href="#" className="text-sm md:text-base font-normal hover:text-slate-300 transition-colors">Terms of Service &amp; Privacy Policy</Link>
              </div>
            </div>
          </div>
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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
