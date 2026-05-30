"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, History, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { navigationItems } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useShellUi } from "./shell-ui-context";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = navigationItems.find((item) => item.href === pathname);
  const { user, signOut } = useAuth();
  const { openNav, openSessions, isChatRoute } = useShellUi();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={openNav}
          className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-cyan-500/10">
            <Image
              src="/assets/EduAgent%20AI%20Logo.png"
              alt="EduAgent AI"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-heading text-sm font-semibold text-white">EduAgent AI</p>
            <p className="text-xs text-slate-400">Premium AI tutoring SaaS</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {isChatRoute ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={openSessions}
              className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              aria-label="Open study sessions"
            >
              <History className="h-4 w-4" />
            </Button>
          ) : (
            <div className="relative hidden flex-1 md:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search lessons, students, uploads..." className="pl-11" />
            </div>
          )}
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-300 to-sky-500" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user.email ?? "Student Admin"}</p>
                <p className="text-xs text-slate-400">{currentPage?.label ?? (isChatRoute ? "Conversation" : "Personalized tutor")}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut} className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
