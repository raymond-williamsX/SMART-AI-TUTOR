import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Settings2,
  MessageSquareText,
  Upload,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "AI Chat", href: "/chat", icon: MessageSquareText },
  { label: "Upload", href: "/upload", icon: Upload },
  // { label: "Schedule", href: "/schedule", icon: CalendarDays },
  // { label: "Progress", href: "/progress", icon: BookOpen },
  // { label: "Settings", href: "/settings", icon: Settings2 },
];
