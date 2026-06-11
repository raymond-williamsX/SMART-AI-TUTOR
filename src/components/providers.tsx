"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthProvider } from "@/providers/auth-provider";
import { DashboardProvider } from "@/context/dashboard-context";

export function Providers({ children, initialSession }: { children: ReactNode; initialSession?: Session | null }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider initialSession={initialSession}>
        <DashboardProvider>{children}</DashboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

