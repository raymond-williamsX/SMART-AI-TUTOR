"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

type Course = {
  id: string;
  code: string;
  title: string;
};

type MentionPopoverProps = {
  courses: Course[];
  onSelect: (course: Course) => void;
  isOpen: boolean;
  query: string;
};

export function MentionPopover({ courses, onSelect, isOpen, query }: MentionPopoverProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = courses.filter((course) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      course.code.toLowerCase().includes(q) ||
      course.title.toLowerCase().includes(q)
    );
  });

  // Reset active index when query or open state changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLLIElement>(
      `[data-index="${activeIndex}"]`
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Keyboard navigation — hoisted to document so textarea doesn't consume it first
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === 0 ? Math.max(filtered.length - 1, 0) : prev - 1
        );
      } else if (e.key === "Enter") {
        if (filtered.length > 0) {
          e.preventDefault();
          onSelect(filtered[activeIndex] ?? filtered[0]);
        }
      }
      // Escape is handled by the parent (ChatInput)
    }

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [isOpen, filtered, activeIndex, onSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mention-popover"
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="absolute bottom-full mb-2 left-0 w-full max-w-sm z-50 bg-[#141414] border border-white/10 rounded-xl overflow-hidden"
          role="listbox"
          aria-label="Course mentions"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
            <BookOpen className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Scope to course
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-slate-500">
              No courses found
            </div>
          ) : (
            <ul ref={listRef} className="max-h-52 overflow-y-auto py-1 scrollbar-hide">
              {filtered.map((course, index) => (
                <li
                  key={course.id}
                  data-index={index}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => {
                    // prevent textarea blur
                    e.preventDefault();
                    onSelect(course);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none transition-colors ${
                    index === activeIndex
                      ? "bg-[#202020]"
                      : "hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span className="inline-flex items-center rounded-md bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[11px] font-bold text-cyan-400 font-mono shrink-0">
                    {course.code}
                  </span>
                  <span className="truncate text-sm text-slate-200">{course.title}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-3 px-3 py-2 border-t border-white/5">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">↑↓</kbd>
            <span className="text-[10px] text-slate-500">navigate</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">↵</kbd>
            <span className="text-[10px] text-slate-500">select</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">Esc</kbd>
            <span className="text-[10px] text-slate-500">dismiss</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
