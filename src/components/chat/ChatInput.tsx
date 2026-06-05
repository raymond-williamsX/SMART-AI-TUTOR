"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, ArrowUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSend, onUpload, disabled, isUploading }: { onSend: (text: string) => void; onUpload?: (file: File) => void; disabled?: boolean; isUploading?: boolean }) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="relative flex w-full flex-col">
      <div className="flex w-full items-end gap-2 rounded-[1.5rem] bg-[#141414] border border-white/10 p-2 focus-within:border-cyan-500/30 transition-colors shadow-lg">
        <div className="flex items-center gap-1 mb-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="application/pdf"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload attachment" 
            disabled={disabled || isUploading} 
            className={`h-9 w-9 rounded-full transition-colors ${isUploading ? "text-cyan-400 animate-pulse" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            aria-label="Search Web" 
            disabled={disabled} 
            className="h-9 w-9 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Globe className="h-5 w-5" />
          </Button>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message EduAgent..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          rows={1}
          className="my-auto min-h-[24px] max-h-[200px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-[10px] text-base text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 scrollbar-hide"
        />
        <Button 
          onClick={submit} 
          disabled={disabled || !text.trim()} 
          size="icon" 
          aria-label="Send message" 
          className={`h-9 w-9 shrink-0 rounded-full mb-1 transition-colors ${text.trim() ? "bg-white text-black hover:bg-slate-200" : "bg-white/10 text-white/30"}`}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
