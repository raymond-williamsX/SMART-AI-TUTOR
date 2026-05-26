"use client";

<<<<<<< HEAD
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
=======
import { useState, type ReactNode } from "react";
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118

import { cn } from "@/lib/utils";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
<<<<<<< HEAD
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat";
  const [collapsed, setCollapsed] = useState(isChatRoute);

  useEffect(() => {
    setCollapsed(isChatRoute);
  }, [isChatRoute]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!isChatRoute ? <Topbar /> : null}
        <main
          className={cn(
            "min-h-0 flex-1 overflow-hidden pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-8",
            isChatRoute ? "px-2 pt-2 sm:px-3 sm:pt-3 lg:px-4 lg:pt-4" : "px-4 pt-6 sm:px-6 lg:px-8"
          )}
        >
=======
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <Topbar />
        <main className={cn("flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-8 lg:pb-8")}>
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}