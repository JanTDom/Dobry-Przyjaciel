"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, BookOpen, ShieldAlert, HeartHandshake } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Przystań", icon: <Flame size={20} /> },
    { href: "/memory", label: "Poznanie", icon: <HeartHandshake size={20} /> },
    { href: "/sanctuary", label: "Skarbiec", icon: <BookOpen size={20} /> },
    { href: "/sos", label: "Spokój SOS", icon: <ShieldAlert size={20} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sanctuary-950/95 backdrop-blur-2xl border-t border-sanctuary-800/80 px-4 py-2 pb-safe">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-hearth-300 font-medium" : "text-sanctuary-500 hover:text-sanctuary-300"
              }`}
            >
              <div className={isActive ? "text-hearth-400" : "text-sanctuary-500"}>
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
