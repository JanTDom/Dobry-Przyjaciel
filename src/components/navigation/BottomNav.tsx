"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, ShieldAlert, HeartHandshake } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Przystań", icon: <Sun size={20} /> },
    { href: "/memory", label: "Poznanie", icon: <HeartHandshake size={20} /> },
    { href: "/sanctuary", label: "Skarbiec", icon: <BookOpen size={20} /> },
    { href: "/sos", label: "Spokój SOS", icon: <ShieldAlert size={20} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-cream-300 px-4 py-2 pb-safe shadow-lg">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-sun-600 font-medium" : "text-cream-500 hover:text-cream-800"
              }`}
            >
              <div className={isActive ? "text-sun-600" : "text-cream-400"}>
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
