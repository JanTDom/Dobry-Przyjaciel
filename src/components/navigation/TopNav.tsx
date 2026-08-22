"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, ShieldAlert, HeartHandshake, PhoneCall, Sparkles } from "lucide-react";

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
    { href: "/", label: "Przystań", icon: <Sun size={16} /> },
    { href: "/memory", label: "Jak cię poznałem", icon: <HeartHandshake size={16} /> },
    { href: "/sanctuary", label: "Skarbiec siły", icon: <BookOpen size={16} /> },
    { href: "/sos", label: "Strefa spokoju SOS", icon: <ShieldAlert size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-cream-50/90 border-b border-cream-300/80 shadow-warm-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo i nazwa ze słonecznym akcentem */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sun-500 via-amber-400 to-yellow-300 p-[2px] shadow-md shadow-sun-500/25 group-hover:scale-105 transition-transform">
            <div className="h-full w-full rounded-[14px] bg-cream-50 flex items-center justify-center">
              <Sun size={20} className="text-sun-600 animate-spin-slow" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-medium text-cream-900 tracking-tight leading-none">
              Dobry Przyjaciel
            </span>
            <span className="text-[11px] text-cream-600 font-sans tracking-wide leading-tight mt-0.5">
              Twoja bezpieczna przystań
            </span>
          </div>
        </Link>

        {/* Główne linki nawigacyjne (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-cream-200/70 border border-cream-300/80 rounded-full px-2 py-1 shadow-inner">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans transition-all ${
                  isActive
                    ? "bg-white text-cream-950 font-medium shadow-sm border border-cream-300/90"
                    : "text-cream-700 hover:text-cream-950 hover:bg-cream-100/80"
                }`}
              >
                <span className={isActive ? "text-sun-600" : "text-cream-500"}>
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
              className="hearth-button flex items-center gap-2 font-sans font-medium text-xs px-4 py-2 rounded-full active:scale-95 transition-all"
            >
              <PhoneCall size={14} className="animate-pulse" />
              <span className="hidden sm:inline">Rozmawiaj na żywo</span>
              <span className="sm:hidden">Głos</span>
            </button>
          )}

          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="hidden sm:flex items-center gap-1.5 text-xs text-cream-800 hover:text-cream-950 bg-white/90 hover:bg-white px-3.5 py-1.5 rounded-full border border-cream-300 shadow-sm transition-all"
            >
              <Sparkles size={13} className="text-sun-500" />
              <span>Opieka</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
