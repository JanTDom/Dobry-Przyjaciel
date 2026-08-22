"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shield, Heart, BookOpen, Crown, Menu, X, SunMedium } from "lucide-react";
import { UserProfile } from "@/types";

interface TopNavProps {
  profile: UserProfile;
  onOpenPricing: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ profile, onOpenPricing }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Obecność & Rozmowa", icon: <Sparkles className="w-4 h-4" /> },
    { href: "/sos", label: "Strefa SOS (Uziemienie)", icon: <Shield className="w-4 h-4 text-rose-400" /> },
    { href: "/memory", label: "Pamięć & Więź", icon: <Heart className="w-4 h-4 text-amber-400" /> },
    { href: "/sanctuary", label: "Skarbiec Zwycięstw", icon: <BookOpen className="w-4 h-4 text-calmTeal-400" /> },
  ];

  return (
    <header className="w-full bg-surface-300/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-rose-400 p-[1px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-surface-300 rounded-2xl flex items-center justify-center">
              <SunMedium className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              DOBRY PRZYJACIEL
              <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {profile.companionName}
              </span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 tracking-wide font-mono whitespace-nowrap">dobryprzyjaciel.pl</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-200/80 p-1.5 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action & Subscription */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-200 border border-amber-500/30 text-xs font-medium transition-all shadow-md active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Dostęp Premium</span>
            <span className="sm:hidden">Premium</span>
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-surface-200"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-200/95 border-b border-white/10 px-4 py-3 space-y-1 backdrop-blur-3xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
