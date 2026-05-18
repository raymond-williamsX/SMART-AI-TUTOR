import {
  BarChart3,
  BookOpen,
  CalendarDays,
  MessageSquareText,
  Upload,
} from "lucide-react";

export const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Chat", href: "/chat", icon: MessageSquareText },
  { label: "Progress", href: "/progress", icon: BookOpen },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
] as const;
