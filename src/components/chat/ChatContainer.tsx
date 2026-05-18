"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage as MsgType } from "@/lib/chat/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

function makeUserMessage(text: string): MsgType {
  return { id: `u-${Date.now()}`, role: "user", content: text, timestamp: Date.now() };
}

export function ChatContainer() {
  const [messages, setMessages] = useState<MsgType[]>([
    {
      id: "welcome-assistant",
      role: "assistant",
      content:
        "Hi, I am EduAgent. Tell me what you want to learn today, and I will explain it step-by-step with examples.",
      timestamp: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text: string) {
    const userMsg = makeUserMessage(text);

    let payloadMessages: MsgType[] = [];
    setMessages((prev) => {
      payloadMessages = [...prev, userMsg];
      return payloadMessages;
    });

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        throw new Error("Chat API failed");
      }

      const data = await res.json();
      const aiMsg: MsgType = data?.message;

      if (aiMsg) {
        setMessages((m) => [...m, aiMsg]);
      } else {
        setMessages((m) => [
          ...m,
          { id: `ai-${Date.now()}`, role: "assistant", content: "Sorry, no response.", timestamp: Date.now() },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { id: `ai-${Date.now()}`, role: "assistant", content: "Network error. Try again.", timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[70vh] max-h-[760px] w-full flex-col gap-4">
      <div className="scrollbar-hide flex-1 overflow-y-auto rounded-2xl border border-white/6 p-6">
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {loading ? (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          ) : null}

          <div ref={endRef} />
        </div>
      </div>

      <div className="w-full">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
