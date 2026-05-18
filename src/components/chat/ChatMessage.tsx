"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatMessage as MsgType } from "@/lib/chat/types";

export function ChatMessage({ message }: { message: MsgType }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] break-words rounded-2xl p-3 leading-relaxed",
          isUser ? "bg-cyan-400/10 text-cyan-100" : "bg-white/6 text-slate-200"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="mt-2 text-xs text-slate-400">{new Date(message.timestamp).toLocaleTimeString()}</div>
      </div>
    </motion.div>
  );
}
