"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <Topbar />
        <main className={cn("flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-8 lg:pb-8")}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}