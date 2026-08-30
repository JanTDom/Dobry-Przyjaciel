"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Compass, BookOpen, Shield } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Rozmowa", icon: <MessageSquare size={19} strokeWidth={1.75} /> },
    { href: "/memory", label: "Pamięć", icon: <Compass size={19} strokeWidth={1.75} /> },
    { href: "/sanctuary", label: "Listy", icon: <BookOpen size={19} strokeWidth={1.75} /> },
    { href: "/sos", label: "Ukojenie", icon: <Shield size={19} strokeWidth={1.75} /> },
  ];

  return (
    <nav
      aria-label="Nawigacja mobilna"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-2xl border-t border-warm-amber/15 px-3 pt-1.5 pb-safe-nav shadow-quiet-lg select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] py-1.5 px-3 rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
                isActive ? "text-ink font-semibold" : "text-ink-subtle hover:text-ink"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? "text-warm-amber scale-110" : "text-ink-subtle"}`}>
                {link.icon}
              </div>
              <span className="text-[11px] font-sans tracking-tight">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
