"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-2.5 shadow-glow backdrop-blur-xl">
      <div className="flex w-full items-end gap-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question or describe a topic..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          rows={1}
          className="min-h-[50px] max-h-36 flex-1 resize-none overflow-y-auto rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button onClick={submit} disabled={disabled} size="icon" aria-label="Send message" className="h-12 w-12 shrink-0 rounded-xl">
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-slate-400">Press Enter to send, Shift + Enter for a new line.</p>
    </div>
  );
}
