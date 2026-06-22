"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Brain, User } from "lucide-react";

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

  const renderedContent = isUser ? (
    <div className="whitespace-pre-wrap break-words text-slate-200 text-base leading-relaxed">{safeMessage.content || "(empty message)"}</div>
  ) : safeMessage.content ? (
    <div className="markdown-content break-words text-slate-200 text-base leading-relaxed prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="mb-4 mt-6 font-heading text-2xl font-semibold text-white first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-5 font-heading text-xl font-semibold text-white first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-3 mt-4 font-heading text-lg font-semibold text-white first:mt-0">{children}</h3>,
          ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-slate-700 pl-4 italic text-slate-300">{children}</blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href ?? "#"} className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-300">
              {children}
            </a>
          ),
          code: ({ children, className, inline }: any) =>
            inline ? (
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-cyan-200">{children}</code>
            ) : (
              <code className={cn("block overflow-x-auto whitespace-pre rounded-lg bg-[#141414] border border-white/10 p-4 font-mono text-sm text-slate-200 mb-4", className)}>
                {children}
              </code>
            ),
          pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-lg bg-[#141414] border border-white/10 p-0">{children}</pre>,
        }}
      >
        {safeMessage.content}
      </ReactMarkdown>
    </div>
  ) : (
    <div className="text-slate-400 italic">Message unavailable.</div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full gap-4 group px-2 sm:px-0"
    >
      <div className="flex-shrink-0 flex flex-col items-center">
        {isUser ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300">
            <User className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Brain className="h-5 w-5" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 pt-1">
        <div className="font-semibold text-slate-100 mb-1">
          {isUser ? "You" : "EduAgent"}
        </div>
        <div className="text-slate-200">
          {renderedContent}
        </div>
      </div>
    </motion.div>
  );
}
