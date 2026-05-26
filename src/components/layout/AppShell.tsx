"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat";
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    setSidebarExpanded(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar expanded={sidebarExpanded} onExpandedChange={setSidebarExpanded} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {!isChatRoute ? <Topbar /> : null}
        <main
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden pb-6 sm:pb-8",
            isChatRoute ? "px-2 pt-2 sm:px-3 sm:pt-3 lg:px-4 lg:pt-4" : "px-4 pt-6 sm:px-6 lg:px-8"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}