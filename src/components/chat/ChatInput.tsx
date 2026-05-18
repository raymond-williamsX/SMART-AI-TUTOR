"use client";

import { useState } from "react";
import { PaperPlane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="flex w-full gap-3">
      <Input
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
      />
      <Button onClick={submit} disabled={disabled} size="icon" aria-label="Send message">
        <PaperPlane className="h-4 w-4" />
      </Button>
    </div>
  );
}
