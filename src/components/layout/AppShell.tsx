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
  const [collapsed, setCollapsed] = useState(isChatRoute);

  useEffect(() => {
    setCollapsed(isChatRoute);
  }, [isChatRoute]);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {!isChatRoute ? <Topbar /> : null}
        <main
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden pb-[calc(7.5rem+env(safe-area-inset-bottom))] lg:pb-8",
            isChatRoute ? "px-2 pt-2 sm:px-3 sm:pt-3 lg:px-4 lg:pt-4" : "px-4 pt-6 sm:px-6 lg:px-8"
          )}
        >
          {children}
        </main>
      </div>
      {!isChatRoute ? <MobileNav /> : null}
    </div>
  );
}