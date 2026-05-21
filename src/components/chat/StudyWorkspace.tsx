"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Clock3, Loader2, Menu, Plus, RefreshCcw, Search } from "lucide-react";

import { ChatInput } from "./ChatInput";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { ChatErrorBoundary } from "./chat-error-boundary";
import { TypingIndicator } from "./TypingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { ChatMessage } from "@/lib/chat/types";
import { DEFAULT_STUDY_SESSION_TITLE } from "@/lib/study-sessions/title";
import type { StudyMessageRole, StudySessionRecord } from "@/lib/study-sessions/types";

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
  content:
    "Hi, I'm EduAgent, your AI tutor. Ask me anything you'd like to learn, and I'll explain it step-by-step with clear examples.",
  timestamp: Date.now(),
};

const starterPrompts = [
  "Explain photosynthesis like I'm 12.",
  "Compare mitosis and meiosis with a simple table.",
  "Make me a 7-day study plan for algebra.",
];

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function safeTimestamp(value: unknown) {
  const timestamp = typeof value === "number" ? value : Date.parse(String(value ?? ""));
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function sortSessions(sessions: StudySessionRecord[] = []) {
  return [...sessions]
    .filter(Boolean)
    .sort((left, right) => safeTimestamp(right.updatedAt) - safeTimestamp(left.updatedAt));
}

function normalizeMessage(message: StudySessionRecord["messages"][number] | null | undefined) {
  if (!message) {
    return null;
  }

  return {
    id: safeString(message.id, `message-${Date.now()}`),
    role: (message.role === "assistant" ? "assistant" : "user") as StudyMessageRole,
    content: safeString(message.content),
    createdAt: new Date(safeTimestamp(message.createdAt)).toISOString(),
  };
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function normalizeSession(session: StudySessionRecord | null | undefined) {
  if (!session) {
    return null;
  }

  const messages = Array.isArray(session.messages)
    ? session.messages.map(normalizeMessage).filter(isDefined)
    : [];

  return {
    id: safeString(session.id, `session-${Date.now()}`),
    title: safeString(session.title, DEFAULT_STUDY_SESSION_TITLE) || DEFAULT_STUDY_SESSION_TITLE,
    topicCategory: safeString(session.topicCategory, "General") || "General",
    lastMessage: safeString(session.lastMessage),
    createdAt: safeString(session.createdAt, new Date().toISOString()),
    updatedAt: safeString(session.updatedAt, new Date().toISOString()),
    messages,
  } satisfies StudySessionRecord;
}

function sessionToMessages(session: StudySessionRecord | null | undefined): ChatMessage[] {
  const normalizedSession = normalizeSession(session);

  if (!normalizedSession || normalizedSession.messages.length === 0) {
    return [WELCOME_MESSAGE];
  }

  return normalizedSession.messages
    .map((message) => {
      const normalized = normalizeMessage(message);

      return normalized
        ? {
            id: normalized.id,
            role: normalized.role,
            content: normalized.content,
            timestamp: safeTimestamp(normalized.createdAt),
          }
        : null;
    })
    .filter(Boolean) as ChatMessage[];
}

function getPreview(session: StudySessionRecord) {
  const preview = safeString(session.lastMessage).trim();
  return preview || "No messages yet";
}

function MessageViewportFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center p-6">
      <div className="max-w-md rounded-[1.75rem] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-50">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          Message renderer failed
        </div>
        <p className="mt-2 leading-6 text-red-100">
          The message viewport hit a rendering error. You can reset the view without losing the rest of the app shell.
        </p>
        <p className="mt-2 break-words text-xs text-red-100/80">{error.message}</p>
        <Button type="button" variant="outline" onClick={reset} className="mt-4 border-red-300/30 bg-white/5 text-red-50 hover:bg-white/10">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset view
        </Button>
      </div>
    </div>
  );
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
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const activeMessages = useMemo(() => sessionToMessages(activeSession), [activeSession]);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sessions;
    }

    return sessions.filter((session) => {
      return [session.title, session.topicCategory, session.lastMessage].some((value) =>
        safeString(value).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, sessions]);

  useEffect(() => {
    shouldAutoScrollRef.current = true;
  }, [activeSessionId]);

  useEffect(() => {
    const container = messagesScrollRef.current;

    if (!container) {
      return;
    }

    function updateAutoScrollState() {
      const currentContainer = messagesScrollRef.current;

      if (!currentContainer) {
        return;
      }

      const distanceFromBottom = currentContainer.scrollHeight - currentContainer.scrollTop - currentContainer.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < 160;
    }

    container.addEventListener("scroll", updateAutoScrollState, { passive: true });
    updateAutoScrollState();

    return () => {
      container.removeEventListener("scroll", updateAutoScrollState);
    };
  }, [activeSessionId]);

  useEffect(() => {
    if (!ready || authLoading) {
      return;
    }

    if (!user) {
      setSessions([]);
      setActiveSessionId(null);
      setLoadingSessions(false);
      return;
    }

    let isMounted = true;

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

        if (!isMounted) {
          return;
        }

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message || "Unable to load study sessions.");
        }

        const nextSessions = sortSessions((payload.data?.sessions ?? []).map(normalizeSession).filter(Boolean) as StudySessionRecord[]);

        setSessions(nextSessions);
        setActiveSessionId((current) => {
          if (current && nextSessions.some((session) => session.id === current)) {
            return current;
          }

          return nextSessions[0]?.id ?? null;
        });
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : "Unable to load study sessions.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoadingSessions(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [authLoading, ready, user]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return;
    }

    const container = messagesScrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: activeMessages.length <= 2 ? "auto" : "smooth",
    });
  }, [activeMessages.length, activeSessionId, sending]);

  function upsertSession(session: StudySessionRecord) {
    const normalizedSession = normalizeSession(session);

    if (!normalizedSession) {
      return;
    }

    setSessions((current) => {
      const withoutCurrent = current.filter((item) => item.id !== normalizedSession.id);
      return sortSessions([normalizedSession, ...withoutCurrent]);
    });
    setActiveSessionId(normalizedSession.id);
    shouldAutoScrollRef.current = true;
  }

  function appendMessage(sessionId: string, message: ChatMessage) {
    const content = safeString(message.content);
    const createdAt = new Date(safeTimestamp(message.timestamp)).toISOString();

    setSessions((current) => {
      let found = false;

      const nextSessions = current.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        found = true;
        const existingMessages = Array.isArray(session.messages) ? session.messages.filter(Boolean) : [];

        return {
          ...session,
          lastMessage: content || session.lastMessage,
          updatedAt: createdAt,
          messages: [
            ...existingMessages,
            {
              id: safeString(message.id, `message-${Date.now()}`),
              role: (message.role === "assistant" ? "assistant" : "user") as StudyMessageRole,
              content,
              createdAt,
            },
          ],
        };
      });

      return found ? sortSessions(nextSessions) : current;
    });

    shouldAutoScrollRef.current = true;
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

    const normalizedSession = normalizeSession(payload.data.session);

    if (!normalizedSession) {
      throw new Error("Unable to create a study session.");
    }

    upsertSession(normalizedSession);
    return normalizedSession;
  }

  async function handleNewSession() {
    if (sending || loadingSessions) {
      return;
    }

    setError(null);

    try {
      const session = await createSession();
      setActiveSessionId(session.id);
      setMobileSessionsOpen(false);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Unable to create a study session.";
      setError(message);
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

      const optimisticMessages = [
        ...(sessionForRequest?.messages ?? []),
        {
          id: userMessage.id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: new Date(userMessage.timestamp).toISOString(),
        },
      ];

      appendMessage(sessionForRequest.id, userMessage);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionForRequest.id,
          messages: optimisticMessages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            timestamp: safeTimestamp(message.createdAt),
          })),
        }),
      });

      const payload = (await response.json()) as ChatApiResponse;

      if (!response.ok || !payload.success) {
        const message = payload.error?.message || "Failed to get a response from the tutor.";
        throw new Error(message);
      }

      if (payload.data?.session) {
        upsertSession(payload.data.session);
      } else if (payload.data?.message) {
        appendMessage(sessionForRequest.id, payload.data.message);
      } else {
        throw new Error("Malformed response from the tutor.");
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

  const showLoadingShell = (!ready || authLoading || loadingSessions) && sessions.length === 0;
  const hasMessages = activeMessages.length > 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3 shadow-glow lg:hidden">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study sessions</p>
          <p className="mt-1 truncate text-sm text-slate-100">{activeSession?.title ?? "Start a session"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => setMobileSessionsOpen((current) => !current)} aria-label="Toggle sessions">
            <Menu className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" onClick={handleNewSession} aria-label="New session" disabled={sending || loadingSessions || authLoading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-glow">
        <div className="flex flex-none flex-col gap-3 border-b border-white/10 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study room</p>
              <h1 className="mt-2 truncate text-2xl font-semibold text-white sm:text-3xl">
                {activeSession?.title ?? "Create your first study session"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Your questions, answers, and session history are stored in Supabase so you can pick up where you left off on any device.
              </p>
            </div>
            <div className="text-sm text-slate-400">
              {showLoadingShell ? (
                <div className="flex items-center gap-2 text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading sessions...
                </div>
              ) : activeSession ? (
                <>
                  <div>{Array.isArray(activeSession.messages) ? activeSession.messages.length : 0} saved messages</div>
                  <div className="mt-1">Updated {new Date(safeTimestamp(activeSession.updatedAt)).toLocaleString()}</div>
                </>
              ) : (
                <div>No session selected</div>
              )}
            </div>
          </div>

          {error ? (
            <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-[19rem] shrink-0 flex-col border-r border-white/10 bg-white/[0.02] p-4 lg:flex">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study sessions</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Resumable workspace</h2>
              </div>
              <Button type="button" size="icon" onClick={handleNewSession} aria-label="New session" disabled={sending || loadingSessions || authLoading}>
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
              {loadingSessions && sessions.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-slate-400">Loading sessions...</div>
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setMobileSessionsOpen(false);
                      shouldAutoScrollRef.current = true;
                    }}
                    className={`w-full rounded-[1.5rem] border px-3 py-3 text-left transition-colors ${
                      session.id === activeSessionId
                        ? "border-cyan-300/25 bg-cyan-400/10"
                        : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05]"
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
                <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-slate-400">
                  No sessions yet. Create one to begin.
                </div>
              )}
            </div>
          </aside>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03]">
              <ChatErrorBoundary
                resetKey={activeSessionId ?? "no-session"}
                fallback={(boundaryError, reset) => <MessageViewportFallback error={boundaryError} reset={reset} />}
              >
                <div ref={messagesScrollRef} className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
                  {showLoadingShell ? (
                    <div className="rounded-[1.75rem] border border-dashed border-slate-400/25 bg-slate-400/5 p-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2 text-slate-200">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing your workspace...
                      </div>
                      <p className="mt-2 leading-7 text-slate-400">We are restoring your sessions and chat history.</p>
                    </div>
                  ) : null}

                  {hasMessages
                    ? activeMessages.map((message) => <ChatMessageComponent key={message.id} message={message} />)
                    : null}

                  {!showLoadingShell && (!activeSession || activeSession.messages.length === 0) ? (
                    <div className="mt-2 rounded-[1.75rem] border border-dashed border-slate-400/25 bg-slate-400/5 p-4 text-sm text-slate-400">
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
              </ChatErrorBoundary>
            </div>

            <div className="flex-none border-t border-white/10 bg-slate-950/35 p-3">
              <ChatInput onSend={handleSend} disabled={sending || loadingSessions || authLoading || !ready} />
            </div>
          </div>
        </div>
      </section>

      {mobileSessionsOpen ? (
        <div className="fixed inset-0 z-30 bg-slate-950/80 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col rounded-[2rem] border border-white/10 bg-slate-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Study sessions</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Session history</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="icon" onClick={handleNewSession} aria-label="New session" disabled={sending || loadingSessions || authLoading}>
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
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setMobileSessionsOpen(false);
                      shouldAutoScrollRef.current = true;
                    }}
                    className={`w-full rounded-[1.5rem] border px-3 py-3 text-left transition-colors ${
                      session.id === activeSessionId
                        ? "border-cyan-300/25 bg-cyan-400/10"
                        : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-slate-100">{session.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{getPreview(session)}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 p-4 text-sm text-slate-400">
                  No sessions yet. Create one to begin.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
