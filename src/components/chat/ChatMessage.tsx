"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import type { ChatMessage as MsgType } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

function safeMessageContent(value: unknown) {
  return typeof value === "string" ? value : "";
}

function safeTimestamp(value: unknown) {
  const timestamp = typeof value === "number" ? value : Date.parse(String(value ?? ""));
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function sourceDetail(source: NonNullable<MsgType["sources"]>[number]) {
  const details = [
    source.page ? `Page ${source.page}` : null,
    source.slide ? `Slide ${source.slide}` : null,
    source.chapter,
    source.section,
  ].filter(Boolean);

  return details.length > 0 ? details.join(" · ") : "Uploaded material";
}

export function ChatMessage({ message }: { message?: MsgType | null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const safeMessage = {
    id: typeof message?.id === "string" ? message.id : "unknown-message",
    role: message?.role === "assistant" ? "assistant" : "user",
    content: safeMessageContent(message?.content),
    timestamp: safeTimestamp(message?.timestamp),
    sources: Array.isArray(message?.sources) ? message.sources : [],
  } satisfies MsgType;

  const isUser = safeMessage.role === "user";
  const timestampLabel = new Date(safeMessage.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const showTimestamp = hasMounted && safeMessage.timestamp > 0 && safeMessage.id !== "welcome-msg";

  const renderedContent = isUser ? (
    <div className="whitespace-pre-wrap break-words text-cyan-50">{safeMessage.content || "(empty message)"}</div>
  ) : safeMessage.content ? (
    <div className="markdown-content break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-6 text-slate-200">{children}</p>,
          h1: ({ children }) => <h1 className="mb-2 mt-4 font-heading text-xl font-semibold text-white first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-3 font-heading text-lg font-semibold text-white first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-3 font-heading text-base font-semibold text-white first:mt-0">{children}</h3>,
          ul: ({ children }) => <ul className="mb-2.5 ml-4 list-disc space-y-1.5 text-slate-200">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2.5 ml-4 list-decimal space-y-1.5 text-slate-200">{children}</ol>,
          li: ({ children }) => <li className="leading-6">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-2.5 border-l-2 border-cyan-300/40 pl-3 italic text-slate-300">{children}</blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href ?? "#"} className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-200">
              {children}
            </a>
          ),
          code: ({ children, className, inline }: any) =>
            inline ? (
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-100">{children}</code>
            ) : (
              <code className={cn("block overflow-x-auto whitespace-pre rounded-xl border border-white/10 bg-slate-950/90 p-3 font-mono text-[13px] text-slate-100", className)}>
                {children}
              </code>
            ),
          pre: ({ children }) => <pre className="mb-3 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/90 p-0">{children}</pre>,
        }}
      >
        {safeMessage.content}
      </ReactMarkdown>
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Message unavailable.</div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "w-full max-w-[min(100%,42rem)] rounded-[1.25rem] border px-3 py-2.5 shadow-glow sm:max-w-[88%]",
          isUser
            ? "border-cyan-300/15 bg-gradient-to-br from-cyan-400/12 to-sky-400/6 text-cyan-50"
            : "border-white/10 bg-white/[0.04] text-slate-200"
        )}
      >
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span>{isUser ? "You" : "EduAgent"}</span>
          <span suppressHydrationWarning>{showTimestamp ? timestampLabel : ""}</span>
        </div>
        <div className={cn("text-[13px] leading-6 sm:text-sm", isUser ? "text-cyan-50" : "text-slate-100")}>{renderedContent}</div>
        {!isUser && safeMessage.sources && safeMessage.sources.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/80">Based on</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {safeMessage.sources.map((source) => (
                <span
                  key={`${source.documentId}-${source.chunkId ?? source.page ?? source.slide ?? source.section ?? source.documentName}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-200"
                >
                  {source.documentName}
                  <span className="text-slate-400"> · {sourceDetail(source)}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
