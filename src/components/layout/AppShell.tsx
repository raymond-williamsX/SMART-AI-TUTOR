"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { ShellUiProvider } from "./shell-ui-context";
import { MobileNav } from "./MobileNav";
import { Topbar } from "./topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat";
  const [navOpen, setNavOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    setSessionsOpen(false);
  }, [pathname]);

  return (
    <ShellUiProvider
      value={{
        navOpen,
        openNav: () => {
          setSessionsOpen(false);
          setNavOpen(true);
        },
        closeNav: () => setNavOpen(false),
        sessionsOpen,
        openSessions: () => {
          setNavOpen(false);
          setSessionsOpen(true);
        },
        closeSessions: () => setSessionsOpen(false),
        isChatRoute,
      }}
    >
      <div className={cn("flex w-full bg-background text-foreground", isChatRoute ? "h-dvh overflow-hidden" : "min-h-screen")}>
        <div className={cn("flex min-w-0 flex-1 flex-col", isChatRoute ? "h-dvh overflow-hidden" : "min-h-screen")}>
          <Topbar />
          <main
            className={cn(
              "min-h-0 flex-1 overflow-x-hidden",
              isChatRoute ? "flex min-h-0 flex-col overflow-hidden px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4" : "px-4 pb-6 pt-6 sm:px-6 sm:pb-8 lg:px-8"
            )}
          >
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </ShellUiProvider>
  );
}
