"use client";

import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/navigation";

import { NavItem } from "./NavItem";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/85 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {navigationItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={pathname === item.href}
            compact
          />
        ))}
      </div>
    </nav>
  );
}