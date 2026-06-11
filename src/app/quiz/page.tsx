"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  Trophy,
  Target,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardShell } from "@/components/layout/DashboardShell";

// ─── Types ─────────────────────────────────────────────────────────────────

type QuizType = "mcq" | "flashcard" | "short_answer";
type Phase = "setup" | "quiz" | "results";

interface Course {
  id: string;
  title: string;
  code: string;
}

interface Material {
  id: string;
  file_name: string;
  course_id: string;
}

interface Question {
  id: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  topic?: string;
}

interface AnswerRecord {
  questionId: string;
  correct: boolean;
  question: Question;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

// TODO: replace with real API call to /api/quiz/generate
const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    question: "What is Newton's First Law?",
    options: [
      "Objects in motion stay in motion",
      "F = ma",
      "Every action has an equal reaction",
      "Energy is conserved",
    ],
    correct_answer: "Objects in motion stay in motion",
    explanation:
      "Newton's First Law states that an object remains at rest or in uniform motion unless acted upon by a net external force.",
    topic: "Classical Mechanics",
  },
  {
    id: "2",
    question: "What is the speed of light?",
    options: [
      "3×10⁸ m/s",
      "3×10⁶ m/s",
      "3×10¹⁰ m/s",
      "3×10⁴ m/s",
    ],
    correct_answer: "3×10⁸ m/s",
    explanation:
      "The speed of light in a vacuum is approximately 299,792,458 metres per second.",
    topic: "Electromagnetism",
  },
  {
    id: "3",
    question: "What is photosynthesis?",
    options: [
      "Process of making food using sunlight",
      "Process of cell division",
      "Process of protein synthesis",
      "Process of DNA replication",
    ],
    correct_answer: "Process of making food using sunlight",
    explanation:
      "Photosynthesis is the process by which plants use sunlight, water, and CO2 to produce oxygen and energy in the form of sugar.",
    topic: "Biology",
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

// Progress Bar
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>
          Question {current} of {total}
        </span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// MCQ Question
function MCQQuestion({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (option: string) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    onAnswer(option === question.correct_answer);
  };

  const getOptionStyle = (option: string) => {
    if (!revealed) {
      return "bg-[#1c1f26] border border-white/10 hover:border-cyan-500/40 hover:bg-[#202020] cursor-pointer";
    }
    if (option === question.correct_answer) {
      return "bg-green-500/20 border border-green-500/50 cursor-default";
    }
    if (option === selected && option !== question.correct_answer) {
      return "bg-red-500/20 border border-red-500/50 cursor-default";
    }
    return "bg-[#1c1f26] border border-white/5 opacity-50 cursor-default";
  };

  const labels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-3">
      {(question.options ?? []).map((option, i) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={`w-full flex items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${getOptionStyle(option)}`}
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-xs font-semibold text-slate-400">
            {labels[i]}
          </span>
          <span className="text-sm text-slate-200 leading-relaxed">
            {option}
          </span>
          {revealed && option === question.correct_answer && (
            <CheckCircle2 className="ml-auto flex-shrink-0 h-4 w-4 text-green-400 mt-0.5" />
          )}
          {revealed &&
            option === selected &&
            option !== question.correct_answer && (
              <XCircle className="ml-auto flex-shrink-0 h-4 w-4 text-red-400 mt-0.5" />
            )}
        </button>
      ))}
      {revealed && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 px-4 py-3"
        >
          <p className="text-xs font-medium text-cyan-400 mb-1">Explanation</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {question.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Flashcard
function FlashcardQuestion({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleFlip = () => {
    if (!answered) setFlipped(true);
  };

  const handleAnswer = (correct: boolean) => {
    setAnswered(true);
    onAnswer(correct);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 3D Card */}
      <div
        className="w-full max-w-xl h-60 cursor-pointer"
        style={{ perspective: "1200px" }}
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#141414] border border-white/10 px-8 py-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <BookOpen className="h-6 w-6 text-cyan-500 mb-4 opacity-60" />
            <p className="text-lg font-medium text-white leading-relaxed">
              {question.question}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Click to reveal answer
            </p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#1c2333] border border-cyan-500/20 px-8 py-6 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CheckCircle2 className="h-6 w-6 text-cyan-400 mb-4 opacity-70" />
            <p className="text-base text-slate-200 leading-relaxed">
              {question.correct_answer}
            </p>
            {question.explanation && (
              <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-sm">
                {question.explanation}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action buttons shown after flip */}
      <AnimatePresence>
        {flipped && !answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            <button
              onClick={() => handleAnswer(false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/25 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Still learning
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/25 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Know it!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Short Answer
function ShortAnswerQuestion({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    // Simple check: non-empty = attempt (mark correct). Real check via AI would come from API.
    const correct = value.trim().length > 0;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitted}
        placeholder="Type your answer here…"
        rows={4}
        className="w-full resize-none rounded-xl bg-[#1c1f26] border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors disabled:opacity-60"
      />
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap className="h-4 w-4" />
          Submit Answer
        </button>
      )}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 ${isCorrect ? "bg-green-500/15 border border-green-500/30" : "bg-red-500/15 border border-red-500/30"}`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300 font-medium">
                  Answer submitted
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300 font-medium">
                  No answer provided
                </span>
              </>
            )}
          </div>
          <div className="rounded-xl bg-[#1c1f26] border border-white/5 px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Correct answer</p>
            <p className="text-sm text-slate-200 leading-relaxed">
              {question.correct_answer}
            </p>
          </div>
          {question.explanation && (
            <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/20 px-4 py-3">
              <p className="text-xs font-medium text-cyan-400 mb-1">
                Explanation
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function QuizPage() {
  useAuth(); // Ensures user is in auth context

  // ── Setup state ──
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [quizType, setQuizType] = useState<QuizType>("mcq");
  const [questionCount, setQuestionCount] = useState<number>(5);

  // ── Phase & questions ──
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [currentAnswered, setCurrentAnswered] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  // ─── Fetch courses & materials on mount ──────────────────────────────────
  const fetchSetupData = useCallback(async () => {
    try {
      const [coursesRes, materialsRes] = await Promise.allSettled([
        fetch("/api/courses"),
        fetch("/api/upload"),
      ]);

      if (coursesRes.status === "fulfilled" && coursesRes.value.ok) {
        const data = await coursesRes.value.json();
        setCourses(data.courses ?? []);
      }

      if (materialsRes.status === "fulfilled" && materialsRes.value.ok) {
        const data = await materialsRes.value.json();
        setMaterials(data.materials ?? []);
      }
    } catch {
      // Non-critical — UI still works with empty lists
    }
  }, []);

  useEffect(() => {
    fetchSetupData();
  }, [fetchSetupData]);

  // ─── Generate quiz ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    setSetupError(null);

    try {
      // TODO: replace with real API call
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: selectedMaterial || null,
          type: quizType,
          count: questionCount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          startQuiz(data.questions.slice(0, questionCount));
          return;
        }
      }
    } catch {
      // Fall through to mock
    }

    // Fallback to mock questions
    const sliced = MOCK_QUESTIONS.slice(0, Math.min(questionCount, MOCK_QUESTIONS.length));
    // Pad with repeats if needed
    const padded: Question[] = [];
    for (let i = 0; i < questionCount; i++) {
      const q = sliced[i % sliced.length];
      padded.push({ ...q, id: `mock-${i}` });
    }
    startQuiz(padded);
  };

  const startQuiz = (qs: Question[]) => {
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentAnswered(false);
    setGenerating(false);
    setPhase("quiz");
  };

  // ─── Handle answer recording ──────────────────────────────────────────────
  const handleAnswer = (correct: boolean) => {
    if (currentAnswered) return;
    setCurrentAnswered(true);
    setAnswers((prev) => [
      ...prev,
      { questionId: questions[currentIndex].id, correct, question: questions[currentIndex] },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setCurrentAnswered(false);
    } else {
      setPhase("results");
    }
  };

  // ─── Results helpers ──────────────────────────────────────────────────────
  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy =
    answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const weakQuestions = answers
    .filter((a) => !a.correct)
    .map((a) => a.question);

  const handleRetryWrong = () => {
    if (weakQuestions.length === 0) return;
    const qs = weakQuestions.map((q, i) => ({ ...q, id: `retry-${i}` }));
    startQuiz(qs);
  };

  const handleNewQuiz = () => {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setCurrentAnswered(false);
  };

  // ─── Accuracy color ───────────────────────────────────────────────────────
  const getAccuracyColor = (acc: number) =>
    acc >= 80
      ? "text-green-400"
      : acc >= 50
        ? "text-cyan-400"
        : "text-red-400";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardShell>
      <div className="h-full overflow-y-auto bg-[#0a0a0a] font-body">
        {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white leading-none">
              AI Quiz Generator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by Gemini
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* ─── Phase 1: Setup ─────────────────────────────────────────── */}
          {phase === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  Create a Quiz
                </h2>
                <p className="text-slate-400 text-sm">
                  Select your study material and configure the quiz to get started.
                </p>
              </div>

              <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-7">
                {/* Material Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                    Study Material
                  </label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full rounded-xl bg-[#1c1f26] border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors appearance-none"
                  >
                    <option value="">— Use general knowledge —</option>
                    {materials.length > 0 ? (
                      materials.map((m) => {
                        const course = courses.find(
                          (c) => c.id === m.course_id
                        );
                        return (
                          <option key={m.id} value={m.id}>
                            {m.file_name}
                            {course ? ` (${course.code})` : ""}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled value="">
                        No materials uploaded yet
                      </option>
                    )}
                  </select>
                  {materials.length === 0 && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      No uploaded materials found. Quiz will use AI general knowledge.
                    </p>
                  )}
                </div>

                {/* Quiz Type Toggle */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    Quiz Type
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        {
                          value: "mcq",
                          label: "MCQ",
                          icon: Target,
                          desc: "Multiple choice",
                        },
                        {
                          value: "flashcard",
                          label: "Flashcard",
                          icon: BookOpen,
                          desc: "Flip & learn",
                        },
                        {
                          value: "short_answer",
                          label: "Short Answer",
                          icon: Zap,
                          desc: "Type your answer",
                        },
                      ] as {
                        value: QuizType;
                        label: string;
                        icon: React.FC<React.SVGProps<SVGSVGElement>>;
                        desc: string;
                      }[]
                    ).map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => setQuizType(value)}
                        className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 border transition-all duration-200 ${
                          quizType === value
                            ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                            : "bg-[#1c1f26] border-white/10 text-slate-400 hover:border-white/20 hover:bg-[#202020]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{label}</span>
                        <span className="text-[10px] opacity-60">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    Number of Questions
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuestionCount(n)}
                        className={`flex-1 rounded-xl py-3 text-sm font-medium border transition-all duration-200 ${
                          questionCount === n
                            ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                            : "bg-[#1c1f26] border-white/10 text-slate-400 hover:border-white/20 hover:bg-[#202020]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {setupError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {setupError}
                  </p>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating your quiz with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>

              {/* Info cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Target,
                    title: "MCQ",
                    desc: "Four options, instant feedback and explanation after each answer.",
                  },
                  {
                    icon: BookOpen,
                    title: "Flashcard",
                    desc: "Flip the card to reveal the answer. Track what you know.",
                  },
                  {
                    icon: Zap,
                    title: "Short Answer",
                    desc: "Write your own answer and compare with the model solution.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="bg-[#141414] border border-white/5 rounded-xl p-4"
                  >
                    <Icon className="h-4 w-4 text-cyan-400 mb-2 opacity-70" />
                    <p className="text-xs font-semibold text-white mb-1">
                      {title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── Phase 2: Quiz Taking ────────────────────────────────────── */}
          {phase === "quiz" && questions.length > 0 && (
            <motion.div
              key={`quiz-${currentIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Progress */}
              <ProgressBar
                current={currentIndex + 1}
                total={questions.length}
              />

              {/* Question Card */}
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-5">
                {/* Topic badge */}
                {questions[currentIndex].topic && (
                  <span className="inline-block text-[10px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2.5 py-0.5">
                    {questions[currentIndex].topic}
                  </span>
                )}

                {/* Question text */}
                <h2 className="text-base font-medium text-white leading-relaxed">
                  {questions[currentIndex].question}
                </h2>

                {/* Question type renderer */}
                {quizType === "mcq" && (
                  <MCQQuestion
                    key={`mcq-${currentIndex}`}
                    question={questions[currentIndex]}
                    onAnswer={handleAnswer}
                  />
                )}
                {quizType === "flashcard" && (
                  <FlashcardQuestion
                    key={`fc-${currentIndex}`}
                    question={questions[currentIndex]}
                    onAnswer={handleAnswer}
                  />
                )}
                {quizType === "short_answer" && (
                  <ShortAnswerQuestion
                    key={`sa-${currentIndex}`}
                    question={questions[currentIndex]}
                    onAnswer={handleAnswer}
                  />
                )}
              </div>

              {/* Next button */}
              <AnimatePresence>
                {currentAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-end"
                  >
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold text-sm hover:bg-cyan-400 transition-colors"
                    >
                      {currentIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          See Results
                          <Trophy className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── Phase 3: Results ────────────────────────────────────────── */}
          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Score hero */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-cyan-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-2">Your score</p>
                <p
                  className={`text-7xl font-heading font-bold mb-2 ${getAccuracyColor(accuracy)}`}
                >
                  {accuracy}%
                </p>
                <p className="text-slate-400 text-sm">
                  {correctCount} correct out of {answers.length} questions
                </p>

                {/* Mini stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-[#1c1f26] rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Correct</p>
                    <p className="text-lg font-semibold text-green-400">
                      {correctCount}
                    </p>
                  </div>
                  <div className="bg-[#1c1f26] rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Wrong</p>
                    <p className="text-lg font-semibold text-red-400">
                      {answers.length - correctCount}
                    </p>
                  </div>
                  <div className="bg-[#1c1f26] rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Total</p>
                    <p className="text-lg font-semibold text-white">
                      {answers.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Weak topics */}
              {weakQuestions.length > 0 && (
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Weak Topics / Missed Questions
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {weakQuestions.map((q, i) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-3 rounded-xl bg-[#1c1f26] border border-white/5 px-4 py-3"
                      >
                        <span className="flex-shrink-0 text-xs text-slate-500 mt-0.5 w-4">
                          {i + 1}.
                        </span>
                        <div className="min-w-0">
                          {q.topic && (
                            <span className="inline-block text-[10px] font-medium text-red-400 bg-red-500/10 rounded-full px-2 py-0.5 mb-1">
                              {q.topic}
                            </span>
                          )}
                          <p className="text-sm text-slate-300 leading-snug">
                            {q.question}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Answer:{" "}
                            <span className="text-slate-300">
                              {q.correct_answer}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {weakQuestions.length > 0 && (
                  <button
                    onClick={handleRetryWrong}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#141414] border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-[#202020] transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 text-cyan-400" />
                    Retry Wrong Questions ({weakQuestions.length})
                  </button>
                )}
                <button
                  onClick={handleNewQuiz}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-400 transition-colors"
                >
                  <Brain className="h-4 w-4" />
                  Start New Quiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </DashboardShell>
  );
}
