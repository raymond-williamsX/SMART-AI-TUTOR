import type { ReactNode } from "react";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="min-h-0 overflow-hidden">{children}</div>;
}
