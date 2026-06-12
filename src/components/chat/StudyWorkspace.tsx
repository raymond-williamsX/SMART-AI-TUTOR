"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, LogOut, Menu, Plus, Search, Brain, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { ChatInput } from "./ChatInput";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { useAuth } from "@/hooks/use-auth";
import type { ChatMessage } from "@/lib/chat/types";
import type { StudySessionRecord } from "@/lib/study-sessions/types";
import type { UploadedMaterialRecord } from "@/lib/uploads/types";

type ApiErrorResponse = {
  code: string;
  message: string;
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

function toChatMessage(message: StudySessionRecord["messages"][number]): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: new Date(message.createdAt).getTime(),
    sources: message.sources ?? [],
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
  const searchParams = useSearchParams();
  const paramSessionId = searchParams.get("sessionId");
  const { user, ready, loading: authLoading, signOut } = useAuth();
  const [sessions, setSessions] = useState<StudySessionRecord[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatCourseId, setChatCourseId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const [activeSessionMaterials, setActiveSessionMaterials] = useState<UploadedMaterialRecord[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Helper to log state consistently
  const logState = useCallback((label: string, overrideMaterials?: UploadedMaterialRecord[]) => {
    const activeSess = sessions.find((s) => s.id === activeSessionId) ?? null;
    const msgCount = activeSess ? activeSess.messages.length : 0;
    const mats = overrideMaterials ?? activeSessionMaterials;
    console.log(`[DOC_DEBUG] ${label}: sessionId=${activeSessionId} documents=${mats.length} documentIds=${JSON.stringify(mats.map(m => m.id))} messageCount=${msgCount} attachmentCount=${mats.length}`);
  }, [activeSessionId, activeSessionMaterials, sessions]);


  const refreshMaterials = useCallback(async (sessionId: string) => {
    try {
      logState(`refreshMaterials start for sessionId=${sessionId}`);
      const response = await fetch(`/api/materials?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await response.json();
      if (response.ok && payload.success && payload.data?.materials) {
        logState(`refreshMaterials success for sessionId=${sessionId}`, payload.data.materials);
        setActiveSessionMaterials(payload.data.materials);
      }
    } catch (err) {
      console.error("Failed to refresh materials for session", err);
    }
  }, [logState]);

  const handleDeleteMaterial = useCallback(async (materialId: string) => {
    if (!activeSessionId) return;
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setActiveSessionMaterials((prev) => prev.filter((m) => m.id !== materialId));
      } else {
        const payload = await response.json();
        throw new Error(payload.error?.message || "Failed to delete document");
      }
    } catch (err) {
      console.error("Failed to delete document", err);
      setError(err instanceof Error ? err.message : "Failed to delete document");
    }
  }, [activeSessionId]);

  useEffect(() => {
    logState(`useEffect load materials trigger: ready=${ready} user=${!!user}`);
    if (!ready || !user || !activeSessionId) {
      logState("useEffect load materials early exit/clear");
      setActiveSessionMaterials([]);
      return;
    }

    let cancelled = false;
    setLoadingMaterials(true);

    void (async () => {
      try {
        const response = await fetch(`/api/materials?sessionId=${encodeURIComponent(activeSessionId)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const payload = await response.json();
        if (cancelled) {
          logState("useEffect load materials completed but cancelled");
          return;
        }
        if (response.ok && payload.success && payload.data?.materials) {
          logState("useEffect load materials success", payload.data.materials);
          setActiveSessionMaterials(payload.data.materials);
        }
      } catch (err) {
        console.error("Failed to load materials for session", err);
      } finally {
        if (!cancelled) setLoadingMaterials(false);
      }
    })();

    return () => {
      logState("useEffect load materials cleanup/cancelled");
      cancelled = true;
    };
  }, [ready, user, activeSessionId, logState]);

  const activeMessages = useMemo(() => sessionToMessages(activeSession), [activeSession]);
  const hasMessages = activeMessages.length > 0;

  // Render logs
  logState("render StudyWorkspace");

  useEffect(() => {
    logState("useEffect activeSessionMaterials or activeMessages state update");
  }, [activeSessionMaterials, activeMessages, logState]);

  useEffect(() => {
    logState("useEffect activeSessionId or sessions state update");
  }, [activeSessionId, sessions, logState]);
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

  // Scroll to bottom on session change or when new messages arrive (only if near bottom)
  const lastMessageCount = useRef(activeMessages.length);
  const lastActiveSessionId = useRef(activeSessionId);

  useEffect(() => {
    const sessionChanged = activeSessionId !== lastActiveSessionId.current;
    const newMessages = activeMessages.length > lastMessageCount.current;
    
    lastActiveSessionId.current = activeSessionId;
    lastMessageCount.current = activeMessages.length;

    if (sessionChanged || sending || (newMessages && isNearBottom)) {
      scrollToBottom();
    }
  }, [activeMessages.length, sending, activeSessionId, isNearBottom]);

  useEffect(() => {
    logState(`useEffect session reload trigger: ready=${ready} user=${!!user}`);
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

        const nextSessions = sortSessions((payload.data?.sessions ?? []).map(normalizeSession));
        logState("session reload API response processing", activeSessionMaterials);
        setSessions(nextSessions);
        if (paramSessionId && nextSessions.some((session) => session.id === paramSessionId)) {
          setActiveSessionId(paramSessionId);
        } else if (nextSessions.length > 0) {
          setActiveSessionId(nextSessions[0].id);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load study sessions.");
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    })();

    return () => { cancelled = true; };
  }, [ready, user, paramSessionId, logState]);

  function upsertSession(session: StudySessionRecord) {
    const normalizedSession = normalizeSession(session);
    setSessions((current) => {
      const withoutCurrent = current.filter((item) => item.id !== normalizedSession.id);
      return sortSessions([normalizedSession, ...withoutCurrent]);
    });
    setActiveSessionId(normalizedSession.id);
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
                sources: message.sources ?? [],
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
    let isNewSession = false;

    try {
      if (!sessionForRequest) {
        sessionForRequest = await createSession(trimmed);
        isNewSession = true;
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
          ...(chatCourseId ? { courseId: chatCourseId } : {}),
        }),
      });

      const payload = (await response.json()) as ChatApiResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || "Failed to get a response from the tutor.");
      }

      if (payload.data?.session) {
        upsertSession(payload.data.session);
        if (isNewSession) {
          router.replace(`/chat?session=${payload.data.session.id}`);
        }
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

  async function handleUpload(file: File) {
    if (loadingSessions || authLoading || !ready) return;
    
    setError(null);
    setIsUploading(true);
    
    try {
      let sessionForRequest = activeSession;
      let isNewSession = false;
      if (!sessionForRequest) {
        sessionForRequest = await createSession("Uploaded a document for analysis");
        isNewSession = true;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionForRequest.id);

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

      // Refresh the session materials list immediately
      logState(`handleUpload calling refreshMaterials for sessionId=${sessionForRequest.id}`);
      await refreshMaterials(sessionForRequest.id);
      logState(`handleUpload refreshMaterials complete for sessionId=${sessionForRequest.id}`);

      // Add success message
      const successMsg: ChatMessage = {
        id: `sys-${Date.now() + 1}`,
        role: "assistant",
        content: `I've successfully analyzed **${file.name}**! You can now ask me questions about it.`,
        timestamp: Date.now(),
      };
      appendMessage(sessionForRequest.id, successMsg);

      if (isNewSession) {
        router.replace(`/chat?session=${sessionForRequest.id}`);
      }

    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload file.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full relative min-w-0 bg-[#0a0a0a] overflow-hidden">
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
              <ChatInput
                onSend={handleSend}
                onUpload={handleUpload}
                isUploading={isUploading}
                disabled={sending || loadingSessions || authLoading || !ready}
                courseId={chatCourseId ?? undefined}
                onCourseId={(id) => setChatCourseId(id)}
                materials={activeSessionMaterials}
                onDeleteMaterial={handleDeleteMaterial}
              />
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
               <ChatInput
                 onSend={handleSend}
                 onUpload={handleUpload}
                 isUploading={isUploading}
                 disabled={sending || loadingSessions || authLoading || !ready}
                 courseId={chatCourseId ?? undefined}
                 onCourseId={(id) => setChatCourseId(id)}
                 materials={activeSessionMaterials}
                 onDeleteMaterial={handleDeleteMaterial}
               />
               <p className="text-center text-[11px] text-slate-500 mt-2">EduAgent can make mistakes. Consider verifying important information.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
