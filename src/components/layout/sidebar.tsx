"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavItem } from "./NavItem";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-dvh w-[19rem] shrink-0 flex-col border-r border-white/10 bg-slate-950/70 px-4 py-5 backdrop-blur-xl lg:flex"
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold">EduAgent AI</p>
          <p className="text-xs text-slate-300">Adaptive tutoring SaaS</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Learning workspace</Badge>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const active = pathname === item.href;
          return (
            <NavItem
              key={item.href}
              item={item}
              active={active}
            />
          );
        })}
      </nav>

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
    </aside>
  );
}
