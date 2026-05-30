"use client";

import { useEffect } from "react";
import Image from "next/image";
import { LogOut, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { navigationItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { NavItem } from "./NavItem";
import { useShellUi } from "./shell-ui-context";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { navOpen, closeNav } = useShellUi();

  useEffect(() => {
    if (!navOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeNav();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navOpen, closeNav]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        navOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!navOpen}
    >
      <button
        type="button"
        aria-label="Close navigation"
        onClick={closeNav}
        className={cn(
          "absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity",
          navOpen ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex w-[18.5rem] max-w-[86vw] flex-col border-r border-white/10 bg-slate-950/95 px-4 py-5 shadow-[0_24px_80px_rgba(8,15,30,0.5)] backdrop-blur-2xl transition-transform duration-300",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-cyan-500/10">
              <Image src="/assets/EduAgent%20AI%20Logo.png" alt="EduAgent AI" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-white">EduAgent AI</p>
              <p className="text-xs text-slate-300">Adaptive tutoring SaaS</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={closeNav} aria-label="Close navigation" className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href}
              onClick={closeNav}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-5">
          <div className="h-px w-full bg-white/10" />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              closeNav();
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