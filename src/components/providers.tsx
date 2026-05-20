"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
 
import { AuthProvider } from "@/providers/auth-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
