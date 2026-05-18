"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-white/6 p-3">
        <div className="flex items-center gap-1">
          <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="block h-2 w-2 rounded-full bg-slate-300" />
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.12 }} className="block h-2 w-2 rounded-full bg-slate-300" />
          <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.24 }} className="block h-2 w-2 rounded-full bg-slate-300" />
        </div>
      </div>
      <div className="text-sm text-slate-400">EduAgent is typing…</div>
    </div>
  );
}
