export { Sidebar } from "./sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-[280px] shrink-0 border-r border-white/10 bg-slate-950/70 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold">EduAgent AI</p>
            <p className="text-xs text-slate-300">Adaptive tutoring SaaS</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Phase 1 shell</Badge>
        </div>
      </div>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                active ? "bg-cyan-400/12 text-cyan-100" : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6">
        <div className="h-px w-full bg-white/10" />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">RAG ready architecture</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            The shell is prepared for document tutoring, topic tutoring, notes, quizzes, and progress analytics.
          </p>
        </div>
      </div>
    </aside>
  );
}
