"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shield, Heart, BookOpen } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Obecność", icon: <Sparkles className="w-5 h-5" /> },
    { href: "/sos", label: "Strefa SOS", icon: <Shield className="w-5 h-5 text-rose-400" /> },
    { href: "/memory", label: "Pamięć", icon: <Heart className="w-5 h-5 text-amber-400" /> },
    { href: "/sanctuary", label: "Skarbiec", icon: <BookOpen className="w-5 h-5 text-teal-400" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-300/90 backdrop-blur-2xl border-t border-white/10 px-3 py-2 flex items-center justify-around">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive
                ? "text-amber-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {link.icon}
            <span className="text-[10px] tracking-wide">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
