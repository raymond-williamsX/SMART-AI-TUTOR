"use client";

import { Bell, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { navigationItems } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = navigationItems.find((item) => item.href === pathname);
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
      router.push("/login");
<<<<<<< HEAD
=======
      router.refresh();
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search lessons, students, uploads..." className="pl-11" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge className="hidden border-cyan-300/20 bg-cyan-300/10 text-cyan-100 md:inline-flex">Gemini + Elastic ready</Badge>
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-300 to-sky-500" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user.email ?? "Student Admin"}</p>
                <p className="text-xs text-slate-400">{currentPage?.label ?? "Personalized tutor"}</p>
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
