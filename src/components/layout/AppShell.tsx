"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div
      className={cn(
        "flex w-full bg-background text-foreground",
        isChatRoute ? "h-dvh overflow-hidden" : "min-h-screen"
      )}
    >
      <Sidebar />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isChatRoute ? "h-dvh overflow-hidden" : "min-h-screen"
        )}
      >
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden",
            isChatRoute ? "flex min-h-0 flex-col overflow-hidden px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4" : "px-4 pb-6 pt-6 sm:px-6 sm:pb-8 lg:px-8"
          )}
        >
          {children}
        </main>
      </div>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}
