'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  BookOpen,
  Timer,
  NotebookPen,
  Send,
  Trophy,
  Loader2,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

// ─── Types ────────────────────────────────────────────────────────────────────

type Course = {
  id: string;
  code: string;
  title: string;
  description?: string;
};

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Phase = 'setup' | 'active' | 'summary';
type PomodoroMode = 'work' | 'break';

// ─── Constants ────────────────────────────────────────────────────────────────

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const CIRCLE_RADIUS = 88;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PomodoroCircle({
  seconds,
  totalSeconds,
  mode,
  isRunning,
  onPlayPause,
  onStop,
}: {
  seconds: number;
  totalSeconds: number;
  mode: PomodoroMode;
  isRunning: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}) {
  const progress = seconds / totalSeconds;
  const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode Label */}
      <div
        className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${
          mode === 'work'
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}
      >
        {mode === 'work' ? 'Focus Work' : 'Short Break'}
      </div>

      {/* SVG Timer Circle */}
      <div className="relative flex items-center justify-center">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="110"
            cy="110"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="#ffffff08"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="110"
            cy="110"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={mode === 'work' ? '#06b6d4' : '#10b981'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        {/* Time Text */}
        <div className="absolute flex flex-col items-center gap-1">
          <span className="text-5xl font-mono font-bold text-white tracking-tight tabular-nums">
            {formatTime(seconds)}
          </span>
          <span className="text-xs text-slate-500 uppercase tracking-widest">
            remaining
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:bg-[#202020] hover:text-white transition-all text-sm"
        >
          <Square size={15} />
          Reset
        </button>
        <button
          onClick={onPlayPause}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            mode === 'work'
              ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black'
          }`}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
}

function TopicTracker({
  topics,
  onAdd,
}: {
  topics: string[];
  onAdd: (topic: string) => void;
}) {
  const [input, setInput] = useState('');

  const handleMark = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <BookOpen size={15} className="text-cyan-400" />
        Topic Tracker
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleMark()}
          placeholder="Current topic..."
          className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <button
          onClick={handleMark}
          disabled={!input.trim()}
          className="flex items-center gap-1 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-sm hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={14} />
          Mark
        </button>
      </div>

      {/* Completed topics */}
      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {topics.length === 0 && (
            <p className="text-xs text-slate-600 italic px-1">
              No topics marked yet.
            </p>
          )}
          {topics.map((t, i) => (
            <motion.div
              key={`${t}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 px-3 py-2 bg-[#0a0a0a] rounded-xl border border-white/5"
            >
              <CheckCircle2 size={14} className="text-cyan-500 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-300 leading-tight">{t}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QuickNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <NotebookPen size={15} className="text-cyan-400" />
        Quick Notes
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Jot down thoughts, formulas, reminders..."
        rows={5}
        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none leading-relaxed"
      />
    </div>
  );
}

function InlineChat({
  messages,
  courseId,
  sessionId,
  onNewMessage,
}: {
  messages: ChatMsg[];
  courseId: string;
  sessionId: string;
  onNewMessage: (msg: ChatMsg) => void;
}) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMsg = { id: generateId(), role: 'user', content: trimmed };
    onNewMessage(userMsg);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: Date.now(),
            })),
            {
              id: userMsg.id,
              role: 'user',
              content: trimmed,
              timestamp: Date.now(),
            },
          ],
          sessionId,
          courseId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMsg = {
          id: generateId(),
          role: 'assistant',
          content: data.reply ?? data.message ?? 'I received your message.',
        };
        onNewMessage(assistantMsg);
      } else {
        onNewMessage({
          id: generateId(),
          role: 'assistant',
          content: "Sorry, I couldn't process that right now. Please try again.",
        });
      }
    } catch {
      onNewMessage({
        id: generateId(),
        role: 'assistant',
        content: 'Network error. Please check your connection.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-1 pb-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <BookOpen size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">AI Study Assistant</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Ask anything related to your course. I'm here to help you understand concepts, solve problems, and stay on track.
              </p>
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-500/15 border border-cyan-500/20 text-white rounded-br-md'
                    : 'bg-[#1a1a1a] border border-white/5 text-slate-300 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-[#1a1a1a] border border-white/5 flex items-center gap-2">
              <Loader2 size={14} className="text-cyan-400 animate-spin" />
              <span className="text-xs text-slate-500">Thinking…</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-white/5 mt-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask a question about this course…"
          rows={2}
          className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
        />
        <button
          onClick={send}
          disabled={!input.trim() || isSending}
          className="self-end px-3 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ── Phase ─────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('setup');

  // ── Setup ─────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // ── Session ───────────────────────────────────────────────────────────────
  const [sessionId] = useState(() => generateId());
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // ── Pomodoro ──────────────────────────────────────────────────────────────
  const [pomMode, setPomMode] = useState<PomodoroMode>('work');
  const [pomSeconds, setPomSeconds] = useState(WORK_SECONDS);
  const [pomRunning, setPomRunning] = useState(false);
  const pomIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Topics & Notes ────────────────────────────────────────────────────────
  const [topics, setTopics] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);

  // ── Summary ───────────────────────────────────────────────────────────────
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);

  // ─── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // ─── Fetch courses ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          const list: Course[] = Array.isArray(data) ? data : data.courses ?? [];
          setCourses(list);
          if (list.length > 0) setSelectedCourseId(list[0].id);
        }
      } catch {
        // silently fail — user can still proceed if courses fail to load
      } finally {
        setCoursesLoading(false);
      }
    }
    load();
  }, []);

  // ─── Elapsed session timer ─────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (phase === 'active' && sessionStart) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - sessionStart.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, sessionStart]);

  // ─── Pomodoro tick ─────────────────────────────────────────────────────────
  const advancePomMode = useCallback(() => {
    setPomMode((prev) => {
      const next = prev === 'work' ? 'break' : 'work';
      setPomSeconds(next === 'work' ? WORK_SECONDS : BREAK_SECONDS);
      return next;
    });
  }, []);

  useEffect(() => {
    if (pomRunning) {
      pomIntervalRef.current = setInterval(() => {
        setPomSeconds((prev) => {
          if (prev <= 1) {
            advancePomMode();
            return prev === 1 ? 0 : prev;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomIntervalRef.current) clearInterval(pomIntervalRef.current);
    }
    return () => {
      if (pomIntervalRef.current) clearInterval(pomIntervalRef.current);
    };
  }, [pomRunning, advancePomMode]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const startSession = () => {
    if (!selectedCourseId) return;
    setSessionStart(new Date());
    setElapsedSeconds(0);
    setTopics([]);
    setNotes('');
    setChatMessages([]);
    setPomMode('work');
    setPomSeconds(WORK_SECONDS);
    setPomRunning(false);
    setAiSummary(null);
    setPhase('active');
  };

  const endSession = async () => {
    setPomRunning(false);
    const duration = elapsedSeconds;
    setTotalDuration(duration);
    setPhase('summary');
    setSummaryLoading(true);

    // TODO: wire up real AI summary
    // POST /api/study-sessions/{sessionId}/summary
    await new Promise((resolve) => setTimeout(resolve, 2200));
    setAiSummary(
      `Great session! You covered ${topics.length} topic${topics.length !== 1 ? 's' : ''} over ${formatDuration(duration)}. ` +
        `Your notes show solid engagement with the material. Keep up the focused work — ` +
        `consistency is the key to mastery. Consider revisiting any topics that felt unclear before your next session.`
    );
    setSummaryLoading(false);
  };

  const resetToSetup = () => {
    setPomRunning(false);
    setPhase('setup');
    setElapsedSeconds(0);
    setTopics([]);
    setNotes('');
    setChatMessages([]);
    setAiSummary(null);
    setPomMode('work');
    setPomSeconds(WORK_SECONDS);
  };

  const addTopic = (t: string) => setTopics((prev) => [...prev, t]);
  const addChatMsg = (msg: ChatMsg) => setChatMessages((prev) => [...prev, msg]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 size={28} className="text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardShell>
      <div className="h-full w-full flex flex-col min-h-0 bg-[#0a0a0a] text-white">
        <AnimatePresence mode="wait">
        {/* ═══════════════════════════════ SETUP PHASE ══════════════════════════ */}
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="h-full w-full flex items-center justify-center overflow-y-auto px-4 py-8"
          >
            <div className="w-full max-w-md">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex justify-center mb-8"
              >
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Timer size={36} className="text-cyan-400" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">
                Study Session
              </h1>
              <p className="text-slate-400 text-center text-sm mb-10 leading-relaxed">
                Choose a course and start a focused Pomodoro session with AI assistance.
              </p>

              {/* Card */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-8 flex flex-col gap-6">
                {/* Course picker */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">
                    Select Course
                  </label>
                  {coursesLoading ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                      <Loader2 size={15} className="animate-spin" />
                      Loading courses…
                    </div>
                  ) : courses.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                      No courses found. Please enroll in a course first.
                    </p>
                  ) : (
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Session info */}
                <div className="flex flex-col gap-2 px-4 py-3 bg-[#0a0a0a] rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Work interval</span>
                    <span className="text-slate-300 font-medium">25 minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Break interval</span>
                    <span className="text-slate-300 font-medium">5 minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>AI assistance</span>
                    <span className="text-cyan-400 font-medium">Enabled</span>
                  </div>
                </div>

                {/* Start button */}
                <button
                  onClick={startSession}
                  disabled={!selectedCourseId || coursesLoading}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 disabled:cursor-not-allowed text-black font-semibold rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Start Session
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════ ACTIVE SESSION ══════════════════════════ */}
        {phase === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full flex flex-col min-h-0 overflow-hidden"
          >
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141414] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Timer size={15} className="text-cyan-400" />
                </div>
                {selectedCourse && (
                  <div className="px-3 py-1 bg-[#0a0a0a] border border-white/10 rounded-full text-xs font-medium text-slate-300">
                    {selectedCourse.code} · {selectedCourse.title}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Elapsed */}
                <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  {formatTime(elapsedSeconds)}
                </div>

                {/* End Session */}
                <button
                  onClick={endSession}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                  <Square size={14} />
                  End Session
                </button>
              </div>
            </header>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* ── Left/Main Panel ── */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Pomodoro */}
                <div className="flex justify-center items-center py-10 px-6 border-b border-white/5 shrink-0">
                  <PomodoroCircle
                    seconds={pomSeconds}
                    totalSeconds={pomMode === 'work' ? WORK_SECONDS : BREAK_SECONDS}
                    mode={pomMode}
                    isRunning={pomRunning}
                    onPlayPause={() => setPomRunning((p) => !p)}
                    onStop={() => {
                      setPomRunning(false);
                      setPomMode('work');
                      setPomSeconds(WORK_SECONDS);
                    }}
                  />
                </div>

                {/* Inline Chat */}
                <div className="flex-1 flex flex-col overflow-hidden px-6 pt-5 pb-4 min-h-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4 shrink-0">
                    <BookOpen size={15} className="text-cyan-400" />
                    AI Study Assistant
                    {selectedCourse && (
                      <span className="text-xs text-slate-500 font-normal">
                        — scoped to {selectedCourse.code}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <InlineChat
                      messages={chatMessages}
                      courseId={selectedCourseId}
                      sessionId={sessionId}
                      onNewMessage={addChatMsg}
                    />
                  </div>
                </div>
              </div>

              {/* ── Right Sidebar ── */}
              <aside className="w-80 shrink-0 bg-[#141414] border-l border-white/5 flex flex-col gap-6 p-5 overflow-y-auto">
                <TopicTracker topics={topics} onAdd={addTopic} />
                <div className="border-t border-white/5" />
                <QuickNotes value={notes} onChange={setNotes} />
              </aside>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════ POST-SESSION SUMMARY ══════════════════════ */}
        {phase === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="h-full w-full overflow-y-auto flex items-start justify-center px-4 py-16"
          >
            <div className="w-full max-w-2xl flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col items-center gap-4 text-center mb-2">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Trophy size={28} className="text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Session Complete!</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Here's a summary of your study session.
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Duration',
                    value: formatDuration(totalDuration),
                    icon: Timer,
                  },
                  {
                    label: 'Topics Covered',
                    value: topics.length.toString(),
                    icon: CheckCircle2,
                  },
                  {
                    label: 'Notes Taken',
                    value: notes.trim() ? 'Yes' : 'None',
                    icon: NotebookPen,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="bg-[#141414] border border-white/5 rounded-2xl px-4 py-4 flex flex-col gap-1"
                  >
                    <Icon size={16} className="text-cyan-400 mb-1" />
                    <span className="text-lg font-bold text-white">{value}</span>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
              </div>

              {/* Topics list */}
              {topics.length > 0 && (
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BookOpen size={14} className="text-cyan-400" />
                    Topics Covered
                  </h2>
                  <div className="flex flex-col gap-2">
                    {topics.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <CheckCircle2 size={13} className="text-cyan-500 shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick notes */}
              {notes.trim() && (
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <NotebookPen size={14} className="text-cyan-400" />
                    Your Notes
                  </h2>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {notes}
                  </p>
                </div>
              )}

              {/* AI Summary */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen size={14} className="text-cyan-400" />
                  AI Session Summary
                </h2>
                <AnimatePresence mode="wait">
                  {summaryLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 py-3"
                    >
                      <Loader2 size={16} className="text-cyan-400 animate-spin shrink-0" />
                      <span className="text-sm text-slate-500">Generating summary…</span>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="summary"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-slate-300 leading-relaxed"
                    >
                      {aiSummary}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetToSetup}
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Play size={15} />
                  Start New Session
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-[#141414] border border-white/10 text-slate-300 hover:bg-[#202020] hover:text-white rounded-2xl transition-all text-sm font-medium"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
