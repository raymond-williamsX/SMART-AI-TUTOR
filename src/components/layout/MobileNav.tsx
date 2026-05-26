"use client";

import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/navigation";

import { NavItem } from "./NavItem";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="w-[min(100%,26rem)] rounded-full border border-white/10 bg-slate-950/80 px-2 py-2 shadow-[0_24px_80px_rgba(8,15,30,0.45)] backdrop-blur-2xl">
        <div className="grid grid-cols-5 gap-1.5">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href}
              compact
            />
          ))}
        </div>
      </div>
    </nav>
  );
}