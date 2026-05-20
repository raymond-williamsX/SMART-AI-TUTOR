"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthProvider } from "@/providers/auth-provider";

export function Providers({ children, initialSession }: { children: ReactNode; initialSession?: Session | null }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider initialSession={initialSession}>{children}</AuthProvider>
    </ThemeProvider>
  );
}
