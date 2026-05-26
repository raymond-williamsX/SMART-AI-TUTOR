import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, PanelLeftOpen, PanelRightOpen, Sparkles } from "lucide-react";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavItem } from "./NavItem";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar({ collapsed, onToggleCollapsed }: { collapsed?: boolean; onToggleCollapsed?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "hidden min-h-screen shrink-0 border-r border-white/10 bg-slate-950/70 backdrop-blur-xl transition-[width,padding] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-[86px] px-3 py-4" : "w-[272px] px-4 py-5"
      )}
    >
      <div className={cn("mb-4 flex items-center", collapsed ? "justify-center" : "justify-between") }>
        {!collapsed ? (
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        >
          {collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed ? (
        <div className="mb-4 flex items-center gap-2">
          <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Learning workspace</Badge>
        </div>
      ) : null}

      <nav className={cn("space-y-2", collapsed && "mt-1") }>
        {navigationItems.map((item) => {
          const active = pathname === item.href;
          return (
            <NavItem
              key={item.href}
              item={item}
              active={active}
              compact={Boolean(collapsed)}
            />
          );
        })}
      </nav>

      {!collapsed ? (
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
