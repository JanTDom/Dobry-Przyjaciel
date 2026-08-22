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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-2xl border-t border-warm-amber/15 px-4 py-2 pb-safe shadow-quiet-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-ink font-medium" : "text-ink-subtle hover:text-ink"
              }`}
            >
              <div className={isActive ? "text-warm-amber" : "text-ink-subtle"}>
                {link.icon}
              </div>
              <span className="text-[10px] font-sans tracking-tight">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
