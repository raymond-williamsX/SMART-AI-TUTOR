"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, PanelLeftOpen, PanelRightOpen, Sparkles } from "lucide-react";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavItem } from "./NavItem";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar({
  expanded,
  onExpandedChange,
}: {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  const compact = !expanded;

  function openSidebar() {
    onExpandedChange(true);
  }

  function closeSidebar() {
    onExpandedChange(false);
  }

  function toggleSidebar() {
    onExpandedChange(!expanded);
  }

  const asideWidthClass = useMemo(() => {
    if (expanded) {
      return "w-[18rem] sm:w-[19rem]";
    }

    return "w-[4.75rem] sm:w-[5.5rem]";
  }, [expanded]);

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 flex h-dvh shrink-0 flex-col border-r border-white/10 bg-slate-950/70 backdrop-blur-xl transition-[width,padding] duration-200 ease-out",
        asideWidthClass,
        compact ? "px-2.5 py-3 sm:px-3 sm:py-4" : "px-3 py-4 sm:px-4 sm:py-5"
      )}
      onMouseEnter={canHover ? openSidebar : undefined}
      onMouseLeave={canHover ? closeSidebar : undefined}
    >
      <div className={cn("mb-4 flex items-center gap-2", compact ? "justify-center" : "justify-between") }>
        {!compact ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">EduAgent AI</p>
              <p className="text-xs text-slate-300">Adaptive tutoring SaaS</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand navigation"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        )}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={toggleSidebar}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className="h-9 w-9 shrink-0 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        >
          {expanded ? <PanelLeftOpen className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </div>

      {!compact ? (
        <div className="mb-4 flex items-center gap-2">
          <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Learning workspace</Badge>
        </div>
      ) : null}

      <nav className={cn("space-y-2", compact && "mt-1") }>
        {navigationItems.map((item) => {
          const active = pathname === item.href;
          return (
            <NavItem
              key={item.href}
              item={item}
              active={active}
              compact={compact}
            />
          );
        })}
      </nav>

      {!compact ? (
        <div className="mt-auto space-y-4 pt-5">
          <div className="h-px w-full bg-white/10" />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">RAG ready architecture</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              The shell is prepared for document tutoring, topic tutoring, notes, quizzes, and progress analytics.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="w-full justify-start border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      ) : (
        <div className="mt-auto flex justify-center pt-4">
          <Link href="/chat" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Go to chat">
            <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      )}
    </aside>
  );
}
