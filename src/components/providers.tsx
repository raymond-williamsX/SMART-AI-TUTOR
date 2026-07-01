"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode, Suspense } from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthProvider } from "@/providers/auth-provider";
import { DashboardProvider } from "@/context/dashboard-context";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

export function Providers({ children, initialSession }: { children: ReactNode; initialSession?: Session | null }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider initialSession={initialSession}>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <DashboardProvider>{children}</DashboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

