"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, BookOpen, ShieldAlert, HeartHandshake, PhoneCall, Sparkles } from "lucide-react";

interface TopNavProps {
  onOpenLiveCall?: () => void;
  onOpenPricing?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenLiveCall,
  onOpenPricing,
}) => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Przystań", icon: <Flame size={16} /> },
    { href: "/memory", label: "Jak cię poznałem", icon: <HeartHandshake size={16} /> },
    { href: "/sanctuary", label: "Skarbiec siły", icon: <BookOpen size={16} /> },
    { href: "/sos", label: "Strefa spokoju SOS", icon: <ShieldAlert size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-sanctuary-950/85 border-b border-sanctuary-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo i nazwa z ciepłym akcentem */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-hearth-700 via-hearth-500 to-hearth-300 p-[1.5px] shadow-lg shadow-hearth-600/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full rounded-full bg-sanctuary-950 flex items-center justify-center">
              <Flame size={18} className="text-hearth-400 fill-hearth-500/20" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-medium text-sanctuary-100 tracking-tight leading-none">
              Dobry Przyjaciel
            </span>
            <span className="text-[11px] text-sanctuary-400 font-sans tracking-wide leading-tight mt-0.5">
              Twoja bezpieczna przystań
            </span>
          </div>
        </Link>

        {/* Główne linki nawigacyjne (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-sanctuary-900/60 border border-sanctuary-800/80 rounded-full px-2 py-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans transition-all ${
                  isActive
                    ? "bg-hearth-500/20 text-hearth-200 font-medium border border-hearth-500/30 shadow-sm"
                    : "text-sanctuary-400 hover:text-sanctuary-200 hover:bg-sanctuary-800/40"
                }`}
              >
                <span className={isActive ? "text-hearth-400" : "text-sanctuary-500"}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Akcja główna: Rozmowa na żywo */}
        <div className="flex items-center gap-3">
          {onOpenLiveCall && (
            <button
              onClick={onOpenLiveCall}
              className="hearth-button flex items-center gap-2 text-sanctuary-950 font-sans font-medium text-xs px-4 py-2 rounded-full active:scale-95 transition-all"
            >
              <PhoneCall size={14} className="animate-pulse" />
              <span className="hidden sm:inline">Rozmawiaj na żywo</span>
              <span className="sm:hidden">Głos</span>
            </button>
          )}

          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="hidden sm:flex items-center gap-1.5 text-xs text-hearth-300 hover:text-hearth-200 bg-sanctuary-900/80 hover:bg-sanctuary-850 px-3 py-1.5 rounded-full border border-hearth-500/30 transition-all"
            >
              <Sparkles size={13} className="text-hearth-400" />
              <span>Opieka</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
