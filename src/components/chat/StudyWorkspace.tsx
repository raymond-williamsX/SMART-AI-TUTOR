"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, LogOut, Menu, Plus, Search, Brain, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

const starterPrompts = [
  "Explain photosynthesis like I'm 12",
  "Compare mitosis and meiosis",
  "Make me a 7-day study plan for algebra",
  "Help me practice Spanish vocabulary",
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
    return [];
  }
  return session.messages.map(toChatMessage);
}

export function StudyWorkspace() {
  const router = useRouter();
  const { user, ready, loading: authLoading, signOut } = useAuth();
  const [sessions, setSessions] = useState<StudySessionRecord[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const activeMessages = useMemo(() => sessionToMessages(activeSession), [activeSession]);
  const hasMessages = activeMessages.length > 0;
  const showSessionListLoading = loadingSessions && sessions.length === 0;

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sessions;
    return sessions.filter((session) => {
      return [session.title, session.topicCategory, session.lastMessage].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query, sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleTranscriptScroll = () => {
    const container = transcriptRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsNearBottom(distanceFromBottom < 96);
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [activeMessages.length, sending, activeSessionId, isNearBottom]);

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
          headers: { "Content-Type": "application/json" },
        });

        const payload = (await response.json()) as SessionsApiResponse;

        if (cancelled) return;

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message || "Unable to load study sessions.");
        }

        const nextSessions = sortSessions(payload.data?.sessions ?? []);
        setSessions(nextSessions);
        if (nextSessions.length > 0) {
          setActiveSessionId(nextSessions[0].id);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load study sessions.");
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    })();

    return () => { cancelled = true; };
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
          if (session.id !== sessionId) return session;
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
      headers: { "Content-Type": "application/json" },
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
    if (sending || loadingSessions) return;
    setError(null);
    setActiveSessionId(null); // Clear active session to show empty state
    if (window.innerWidth < 768) setMobileSidebarOpen(false);
  }

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending || loadingSessions || authLoading || !ready) return;

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
      setIsNearBottom(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(file: File) {
    if (loadingSessions || authLoading || !ready) return;
    
    setError(null);
    setIsUploading(true);
    
    try {
      let sessionForRequest = activeSession;
      if (!sessionForRequest) {
        // If no session exists, create a generic one so we can attach the PDF to it
        sessionForRequest = await createSession("Uploaded a document for analysis");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionForRequest.id);

      // Add a temporary system message to let user know it's analyzing
      const uploadingMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        role: "assistant",
        content: `*Analyzing your document: ${file.name}...*`,
        timestamp: Date.now(),
      };
      appendMessage(sessionForRequest.id, uploadingMsg);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
         throw new Error(payload.error || "Failed to upload document");
      }

      // Add success message
      const successMsg: ChatMessage = {
        id: `sys-${Date.now() + 1}`,
        role: "assistant",
        content: `I've successfully analyzed **${file.name}**! You can now ask me questions about it.`,
        timestamp: Date.now(),
      };
      appendMessage(sessionForRequest.id, successMsg);

    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload file.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex h-full w-full bg-[#141414] sm:bg-[#0a0a0a]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#141414] transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-[260px] px-3 py-3" : "w-0 px-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={handleNewSession}
            variant="ghost"
            className="flex-1 justify-start gap-2 h-10 hover:bg-[#202020] text-slate-200"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-black">
              <Brain className="h-3 w-3" />
            </div>
            <span className="font-medium">New chat</span>
          </Button>
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-400 hover:text-slate-200 hover:bg-[#202020] ml-2 shrink-0"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mt-2">
          {showSessionListLoading ? (
            <div className="text-xs text-slate-500 px-3 py-2">Loading...</div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-500 px-3 py-2 mb-1">Today</div>
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg truncate transition-colors ${
                    session.id === activeSessionId ? "bg-[#202020] text-white" : "text-slate-300 hover:bg-[#202020] hover:text-white"
                  }`}
                >
                  {session.title || "Untitled Session"}
                </button>
              ))}
            </div>
          ) : (
             <div className="text-xs text-slate-500 px-3 py-2">No history</div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-[#202020]"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative flex w-[260px] flex-col bg-[#141414] px-3 py-3">
             <div className="flex items-center justify-between mb-4">
              <Button
                onClick={handleNewSession}
                variant="ghost"
                className="flex-1 justify-start gap-2 h-10 hover:bg-[#202020] text-slate-200"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-black">
                  <Brain className="h-3 w-3" />
                </div>
                <span className="font-medium">New chat</span>
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto mt-2">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => { setActiveSessionId(session.id); setMobileSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg truncate transition-colors ${
                    session.id === activeSessionId ? "bg-[#202020] text-white" : "text-slate-300 hover:bg-[#202020] hover:text-white"
                  }`}
                >
                  {session.title || "Untitled Session"}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-[#202020]"
                onClick={async () => { await signOut(); router.push("/"); }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#0a0a0a]">
        {/* Mobile Header & Sidebar Toggle */}
        <div className="flex items-center justify-between p-3 md:absolute md:top-0 md:left-0 md:p-4 z-10 w-full">
          {!sidebarOpen && (
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setSidebarOpen(true)}
               className="hidden md:flex h-10 w-10 text-slate-400 hover:text-slate-200 hover:bg-[#202020]"
             >
               <PanelLeftOpen className="h-5 w-5" />
             </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden h-10 w-10 text-slate-400"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="md:hidden font-medium text-slate-200">EduAgent</span>
          <div className="w-10 md:hidden" /> {/* Spacer */}
        </div>

        {error && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-md p-4">
             <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-xl">
               {error}
             </div>
          </div>
        )}

        {hasMessages ? (
          <div 
            className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 pt-16 md:pt-20 scrollbar-hide"
            ref={transcriptRef}
            onScroll={handleTranscriptScroll}
          >
            <div className="mx-auto max-w-3xl flex flex-col gap-6">
              {activeMessages.map((message) => (
                <ChatMessageComponent key={message.id} message={message} />
              ))}
              {sending && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 pb-32">
            <h1 className="text-3xl md:text-4xl font-medium text-white mb-8">Where should we begin?</h1>
            
            <div className="w-full max-w-3xl">
              <ChatInput onSend={handleSend} onUpload={handleUpload} isUploading={isUploading} disabled={sending || loadingSessions || authLoading || !ready} />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-white/10 bg-[#141414] px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-[#202020] hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating Input (when active) */}
        {hasMessages && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent p-4 pb-6">
             <div className="mx-auto max-w-3xl">
               <ChatInput onSend={handleSend} onUpload={handleUpload} isUploading={isUploading} disabled={sending || loadingSessions || authLoading || !ready} />
               <p className="text-center text-[11px] text-slate-500 mt-2">EduAgent can make mistakes. Consider verifying important information.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
