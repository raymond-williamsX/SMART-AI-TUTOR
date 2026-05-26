"use client";

import { useEffect } from "react";
import { LogOut, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { navigationItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { NavItem } from "./NavItem";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex w-[18.5rem] max-w-[86vw] flex-col border-r border-white/10 bg-slate-950/95 px-4 py-5 shadow-[0_24px_80px_rgba(8,15,30,0.5)] backdrop-blur-2xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-white">EduAgent AI</p>
              <p className="text-xs text-slate-300">Adaptive tutoring SaaS</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation" className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href}
              onClick={onClose}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-5">
          <div className="h-px w-full bg-white/10" />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              onClose();
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
    </div>
  );
}