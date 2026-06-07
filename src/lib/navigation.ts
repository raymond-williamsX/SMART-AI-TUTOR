import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Settings2,
  MessageSquareText,
  FolderOpen,
  Upload,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: "AI Chat", href: "/chat", icon: MessageSquareText },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Study Mode", href: "/study", icon: CalendarDays },
  { label: "Quiz Generator", href: "/quiz", icon: Settings2 },
  { label: "Upload", href: "/upload", icon: Upload },
];
