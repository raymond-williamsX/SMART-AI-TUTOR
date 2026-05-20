"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/lib/navigation";

type NavItemProps = {
  item: NavigationItem;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

export function NavItem({ item, active = false, compact = false, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        compact ? "justify-center px-3" : "w-full justify-start",
        active
          ? "border-cyan-300/20 bg-gradient-to-r from-cyan-300/15 to-sky-400/10 text-white shadow-[0_16px_40px_rgba(34,211,238,0.12)]"
          : "border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors",
          active ? "bg-cyan-300/15 text-cyan-100" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white",
          compact && "h-9 w-9"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("truncate", compact && "sr-only")}>{item.label}</span>
    </Link>
  );
}