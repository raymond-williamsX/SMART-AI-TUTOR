"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Menu, Plus, Search } from "lucide-react";

import { ChatInput } from "./ChatInput";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { ChatMessage } from "@/lib/chat/types";
import { DEFAULT_STUDY_SESSION_TITLE } from "@/lib/study-sessions/title";
import type { StudySessionRecord } from "@/lib/study-sessions/types";

type ApiErrorResponse = {
  code: string;
  message: string;
};

type SessionsApiResponse = {
  success: boolean;
  requestId: string;
  data?: {
    sessions: StudySessionRecord[];
  };
  error?: ApiErrorResponse;
};

type SessionCreateApiResponse = {
  success: boolean;
  requestId: string;
  data?: {
    session: StudySessionRecord;
  };
  error?: ApiErrorResponse;
};

type ChatApiResponse = {
  success: boolean;
  requestId: string;
  data?: {
    message: ChatMessage;
    session?: StudySessionRecord;
  };
  error?: ApiErrorResponse;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content: "Hi, I'm EduAgent, your AI tutor. Ask me anything you'd like to learn, and I'll explain it step-by-step with clear examples.",
  timestamp: Date.now(),
};

const starterPrompts = [
  "Explain photosynthesis like I'm 12.",
  "Compare mitosis and meiosis with a simple table.",
  "Make me a 7-day study plan for algebra.",
];

function sortSessions(sessions: StudySessionRecord[] = []) {
  return [...sessions].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function toChatMessage(message: StudySessionRecord["messages"][number]): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: new Date(message.createdAt).getTime(),
  };
}

function sessionToMessages(session: StudySessionRecord | null | undefined): ChatMessage[] {
  if (!session || session.messages.length === 0) {
    return [WELCOME_MESSAGE];
  }

  return session.messages.map(toChatMessage);
}

function getPreview(session: StudySessionRecord) {
  return session.lastMessage.trim() || "No messages yet";
}

export function StudyWorkspace() {
  const { user, ready, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<StudySessionRecord[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const activeMessages = useMemo(() => sessionToMessages(activeSession), [activeSession]);
  const showLoadingShell = (loadingSessions || (!ready && !user)) && sessions.length === 0;
  const hasMessages = activeMessages.length > 0;
  const sessionMessageCount = activeSession?.messages.length ?? 0;
  const showSessionListLoading = loadingSessions && sessions.length === 0;

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sessions;
    }

    return sessions.filter((session) => {
      return [session.title, session.topicCategory, session.lastMessage].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query, sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, sending, activeSessionId]);

  useEffect(() => {
    if (!ready || !user) {
      setSessions([]);
      setActiveSessionId(null);
      setLoadingSessions(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoadingSessions(true);
      setError(null);

      try {
        const response = await fetch("/api/study-sessions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const payload = (await response.json()) as SessionsApiResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message || "Unable to load study sessions.");
        }

        const nextSessions = sortSessions(payload.data?.sessions ?? []);
        setSessions(nextSessions);
        setActiveSessionId((current) => {
          if (current && nextSessions.some((session) => session.id === current)) {
            return current;
          }

          return nextSessions[0]?.id ?? null;
        });
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load study sessions.");
      } finally {
        if (!cancelled) {
          setLoadingSessions(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  function upsertSession(session: StudySessionRecord) {
    setSessions((current) => {
      const withoutCurrent = current.filter((item) => item.id !== session.id);
      return sortSessions([session, ...withoutCurrent]);
    });
    setActiveSessionId(session.id);
  }

  function appendMessage(sessionId: string, message: ChatMessage) {
    setSessions((current) =>
      sortSessions(
        current.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          return {
            ...session,
            lastMessage: message.content,
            updatedAt: new Date(message.timestamp).toISOString(),
            messages: [
              ...session.messages,
              {
                id: message.id,
                role: message.role,
                content: message.content,
                createdAt: new Date(message.timestamp).toISOString(),
              },
            ],
          };
        })
      )
    );
  }

  async function createSession(firstPrompt = "") {
    const response = await fetch("/api/study-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstPrompt,
        title: firstPrompt ? undefined : DEFAULT_STUDY_SESSION_TITLE,
      }),
    });

    const payload = (await response.json()) as SessionCreateApiResponse;

    if (!response.ok || !payload.success || !payload.data?.session) {
      throw new Error(payload.error?.message || "Unable to create a study session.");
    }

    upsertSession(payload.data.session);
    return payload.data.session;
  }

  async function handleNewSession() {
    if (sending || loadingSessions) {
      return;
    }

    setError(null);

    try {
      await createSession();
      setMobileSessionsOpen(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create a study session.");
    }
  }

  async function handleSend(text: string) {
    const trimmed = text.trim();

    if (!trimmed || sending || loadingSessions || authLoading || !ready) {
      return;
    }

    setError(null);
    setSending(true);

    let sessionForRequest = activeSession;

    try {
      if (!sessionForRequest) {
        sessionForRequest = await createSession(trimmed);
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const optimisticMessages = [...(sessionForRequest?.messages ?? []), userMessage];
      appendMessage(sessionForRequest.id, userMessage);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionForRequest.id,
          messages: optimisticMessages,
        }),
      });

      const payload = (await response.json()) as ChatApiResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || "Failed to get a response from the tutor.");
      }

      if (payload.data?.session) {
        upsertSession(payload.data.session);
      } else if (payload.data?.message) {
        appendMessage(sessionForRequest.id, payload.data.message);
      }
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Network error. Please try again.";
      setError(message);

      if (sessionForRequest?.id) {
        appendMessage(sessionForRequest.id, {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `I couldn't process your request: ${message}. Please try again.`,
          timestamp: Date.now(),
        });
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-4 lg:flex-row">
      <div className="flex shrink-0 items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3 shadow-glow lg:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study sessions</p>
          <p className="mt-1 text-sm text-slate-100">{activeSession?.title ?? "Start a session"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => setMobileSessionsOpen((current) => !current)} aria-label="Toggle sessions">
            <Menu className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" onClick={handleNewSession} aria-label="New session" disabled={loadingSessions || authLoading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <aside className="hidden h-full min-h-0 w-[19rem] shrink-0 flex-col rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-glow lg:flex">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study sessions</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Resumable workspace</h2>
          </div>
          <Button type="button" size="icon" onClick={handleNewSession} aria-label="New session">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-[1.25rem] border border-white/10 bg-slate-950/40 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sessions"
            className="border-0 bg-transparent px-0 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
          />
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {showSessionListLoading ? (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-slate-400">Loading sessions...</div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  setActiveSessionId(session.id);
                  setMobileSessionsOpen(false);
                }}
                className={`w-full rounded-[1.5rem] border px-3 py-3 text-left transition-colors ${
                  session.id === activeSessionId ? "border-cyan-300/25 bg-cyan-400/10" : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{session.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{getPreview(session)}</p>
                  </div>
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-slate-400">No sessions yet. Create one to begin.</div>
          )}
        </div>
      </aside>

      {mobileSessionsOpen ? (
        <div className="fixed inset-0 z-30 bg-slate-950/80 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col rounded-[2rem] border border-white/10 bg-slate-950 p-4 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study sessions</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Session history</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="icon" onClick={handleNewSession} aria-label="New session" disabled={loadingSessions || authLoading}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setMobileSessionsOpen(false)} aria-label="Close sessions">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-[1.25rem] border border-white/10 bg-slate-950/40 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sessions"
                className="border-0 bg-transparent px-0 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
              />
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {showSessionListLoading ? (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-slate-400">Loading sessions...</div>
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setMobileSessionsOpen(false);
                    }}
                    className={`w-full rounded-[1.5rem] border px-3 py-3 text-left transition-colors ${
                      session.id === activeSessionId ? "border-cyan-300/25 bg-cyan-400/10" : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-slate-100">{session.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{getPreview(session)}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-slate-400">No sessions yet. Create one to begin.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 shadow-glow sm:p-6">
        <div className="flex shrink-0 flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study room</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{activeSession?.title ?? "Create your first study session"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Your questions, answers, and session history are stored in Supabase so you can pick up where you left off on any device.
            </p>
          </div>
          <div className="text-sm text-slate-400">
            {showLoadingShell ? (
              <>
                <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
                <div className="mt-2 h-4 w-36 animate-pulse rounded-full bg-white/10" />
              </>
            ) : activeSession ? (
              <>
                <div>{sessionMessageCount} saved messages</div>
                <div className="mt-1">Updated {new Date(activeSession.updatedAt).toLocaleString()}</div>
              </>
            ) : (
              <div>No session selected</div>
            )}
          </div>
        </div>

        {error ? <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</div> : null}

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {showLoadingShell ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-400/25 bg-slate-400/5 p-4 text-sm text-slate-400">
                <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-3/4 max-w-lg animate-pulse rounded-full bg-white/10" />
              </div>
            ) : null}

            {hasMessages ? activeMessages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            )) : null}

            {!showLoadingShell && (!activeSession || activeSession.messages.length === 0) ? (
              <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-400/25 bg-slate-400/5 p-4 text-sm text-slate-400">
                <p className="mb-2 font-medium text-slate-200">Ready to help.</p>
                <p className="mb-4 leading-7 text-slate-400">
                  Try a starter prompt or ask your own question. The tutor will answer with structured, step-by-step guidance.
                </p>
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/[0.08]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {sending ? (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 w-full pb-1">
          <ChatInput onSend={handleSend} disabled={sending || loadingSessions || authLoading || !ready} />
        </div>
      </section>
    </div>
  );
}
