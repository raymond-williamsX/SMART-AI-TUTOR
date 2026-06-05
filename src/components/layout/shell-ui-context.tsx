"use client";

import { createContext, useContext, type ReactNode } from "react";

type ShellUiContextValue = {
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  sessionsOpen: boolean;
  openSessions: () => void;
  closeSessions: () => void;
  isChatRoute: boolean;
};

const ShellUiContext = createContext<ShellUiContextValue | null>(null);

export function ShellUiProvider({
  value,
  children,
}: Readonly<{
  value: ShellUiContextValue;
  children: ReactNode;
}>) {
  return <ShellUiContext.Provider value={value}>{children}</ShellUiContext.Provider>;
}

export function useShellUi() {
  const context = useContext(ShellUiContext);

  if (!context) {
    throw new Error("useShellUi must be used within ShellUiProvider");
  }

  return context;
}