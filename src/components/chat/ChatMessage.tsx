"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
<<<<<<< HEAD
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

export function ChatMessage({ message }: { message?: MsgType | null }) {
  const safeMessage = {
    id: typeof message?.id === "string" ? message.id : "unknown-message",
    role: message?.role === "assistant" ? "assistant" : "user",
    content: safeMessageContent(message?.content),
    timestamp: safeTimestamp(message?.timestamp),
  } satisfies MsgType;

  const isUser = safeMessage.role === "user";
  const timestampLabel = new Date(safeMessage.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const renderedContent = isUser ? (
    <div className="whitespace-pre-wrap break-words text-cyan-50">{safeMessage.content || "(empty message)"}</div>
  ) : safeMessage.content ? (
    <div className="markdown-content break-words">
=======
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { cn } from "@/lib/utils";
import type { ChatMessage as MsgType } from "@/lib/chat/types";

export function ChatMessage({ message }: { message: MsgType }) {
  const isUser = message.role === "user";

  const renderedContent = isUser ? (
    <div className="whitespace-pre-wrap break-words">{message.content}</div>
  ) : (
    <div className="markdown-content">
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
<<<<<<< HEAD
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
=======
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-7 text-slate-200">{children}</p>,
          h1: ({ children }) => <h1 className="mb-3 mt-5 font-heading text-2xl font-semibold text-white first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-4 font-heading text-xl font-semibold text-white first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-4 font-heading text-lg font-semibold text-white first:mt-0">{children}</h3>,
          ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-2 text-slate-200">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-2 text-slate-200">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-cyan-300/40 pl-4 italic text-slate-300">{children}</blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-200">
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
              {children}
            </a>
          ),
          code: ({ children, className, inline }: any) =>
            inline ? (
<<<<<<< HEAD
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
=======
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-100">{children}</code>
            ) : (
              <code className={cn("block overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/90 p-4 font-mono text-sm text-slate-100", className)}>
                {children}
              </code>
            ),
          pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/90 p-0">{children}</pre>,
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
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
<<<<<<< HEAD
          "w-full max-w-[min(100%,42rem)] rounded-[1.25rem] border px-3 py-2.5 shadow-glow sm:max-w-[88%]",
=======
          "max-w-[92%] rounded-[1.75rem] border px-4 py-3 shadow-glow sm:max-w-[82%]",
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
          isUser
            ? "border-cyan-300/15 bg-gradient-to-br from-cyan-400/12 to-sky-400/6 text-cyan-50"
            : "border-white/10 bg-white/[0.04] text-slate-200"
        )}
      >
<<<<<<< HEAD
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span>{isUser ? "You" : "EduAgent"}</span>
          <span>{timestampLabel}</span>
        </div>
        <div className={cn("text-[13px] leading-6 sm:text-sm", isUser ? "text-cyan-50" : "text-slate-100")}>{renderedContent}</div>
=======
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
          <span>{isUser ? "You" : "EduAgent"}</span>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
        </div>
        <div className={cn("text-sm leading-7 sm:text-[0.95rem]", isUser ? "text-cyan-50" : "text-slate-100")}>{renderedContent}</div>
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
      </div>
    </motion.div>
  );
}
