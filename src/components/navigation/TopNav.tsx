"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Heart, Sparkles, BookOpen, ShieldAlert, PhoneCall, SlidersHorizontal, LogOut, Compass, User } from "lucide-react";

interface TopNavProps {
  onOpenLiveCall?: () => void;
  onOpenPricing?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  companionName?: string;
  companionGender?: "female" | "male" | "neutral";
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenLiveCall,
  onOpenPricing,
  onOpenSettings,
  onOpenAuth,
  onLogout,
  isLoggedIn = false,
  userName = "Przyjaciel",
  companionName = "Agata",
  companionGender = "female",
}) => {
  const pathname = usePathname();
  // Obsługa zamykania menu klawiszem Escape lub kliknięciem na zewnątrz
  React.useEffect(() => {
    if (!showProfileMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowProfileMenu(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showProfileMenu]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-paper/90 border-b border-warm-amber/15 pt-safe transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo i tożsamość */}
        <Link
          href="/"
          aria-label="Dobry Przyjaciel - Strona główna"
          className="flex items-center gap-3 group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 rounded-xl p-1 -m-1"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-tr from-sun-500 via-sun-400 to-amber-200 p-0.5 shadow-md shadow-sun-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="h-full w-full bg-paper rounded-[14px] flex items-center justify-center text-sun-600">
              <Sun size={20} className="animate-spin-slow text-warm-amber" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-medium tracking-tight text-ink group-hover:text-warm-amber transition-colors">
              Dobry Przyjaciel
            </span>
            <span className="text-[10px] text-ink-muted font-sans tracking-wide uppercase font-semibold hidden sm:inline">
              Osobista przystań i obecność
            </span>
          </div>
        </Link>

        {/* Nawigacja środkowa desktopowa */}
        <nav aria-label="Nawigacja główna" className="hidden md:flex items-center gap-1 bg-paper-dark/80 p-1.5 rounded-full border border-warm-amber/15 shadow-quiet-sm">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
              pathname === "/"
                ? "bg-white text-ink shadow-quiet-sm border border-warm-amber/20"
                : "text-ink-muted hover:text-ink hover:bg-white/50"
            }`}
          >
            Rozmowa
          </Link>
          <Link
            href="/memory"
            aria-current={pathname === "/memory" ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
              pathname === "/memory"
                ? "bg-white text-ink shadow-quiet-sm border border-warm-amber/20"
                : "text-ink-muted hover:text-ink hover:bg-white/50"
            }`}
          >
            Pamięć
          </Link>
          <Link
            href="/sanctuary"
            aria-current={pathname === "/sanctuary" ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
              pathname === "/sanctuary"
                ? "bg-white text-ink shadow-quiet-sm border border-warm-amber/20"
                : "text-ink-muted hover:text-ink hover:bg-white/50"
            }`}
          >
            Listy
          </Link>
          <Link
            href="/sos"
            aria-current={pathname === "/sos" ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
              pathname === "/sos"
                ? "bg-white text-ink shadow-quiet-sm border border-warm-amber/20"
                : "text-ink-muted hover:text-ink hover:bg-white/50"
            }`}
          >
            Ukojenie
          </Link>
        </nav>

        {/* Prawa strona akcji */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {isLoggedIn ? (
            <>
              {onOpenLiveCall && (
                <button
                  onClick={onOpenLiveCall}
                  aria-label="Rozmawiaj na żywo z Przyjacielem"
                  className="presence-btn-primary hidden sm:flex items-center gap-2 text-xs font-sans font-medium px-4 py-2.5 min-h-[44px] rounded-full active:scale-95 transition-all shadow-quiet-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
                >
                  <PhoneCall size={14} className="animate-pulse text-warm-honey" />
                  <span>Rozmawiaj na żywo</span>
                </button>
              )}

              {/* Menu zalogowanego profilu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-expanded={showProfileMenu}
                  aria-haspopup="menu"
                  aria-label={`Menu profilu: ${companionName}`}
                  className="flex items-center gap-2.5 bg-white/95 hover:bg-white border border-warm-amber/25 hover:border-warm-amber/60 px-4 py-2 min-h-[40px] rounded-full shadow-quiet-sm transition-all text-xs font-sans text-ink group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-warm-amber group-hover:scale-125 transition-transform" />
                  <span className="font-medium text-ink">{companionName}</span>
                </button>

                {showProfileMenu && (
                  <>
                    {/* Tło do kliknięcia zamykającego */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                      aria-hidden="true"
                    />

                    <div
                      role="menu"
                      aria-label="Opcje konta"
                      className="absolute right-0 mt-2 w-56 bg-white border border-warm-amber/20 rounded-2xl shadow-quiet-lg p-2 z-50 animate-fade-in text-xs font-sans"
                    >
                      <div className="px-3 py-2 border-b border-ink/8 mb-1">
                        <span className="text-ink-subtle text-[10px] uppercase font-semibold block">Zalogowano jako</span>
                        <span className="text-ink font-serif text-sm font-medium">{userName}</span>
                      </div>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-ink hover:bg-paper-dark flex items-center gap-2 transition-colors min-h-[40px] focus-visible:outline-none focus-visible:bg-paper-dark"
                      >
                        <SlidersHorizontal size={14} className="text-warm-amber" />
                        <span>Ustawienia przyjaciela</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onOpenPricing) onOpenPricing();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-cream-800 hover:bg-cream-100 flex items-center gap-2 transition-colors min-h-[40px] focus-visible:outline-none focus-visible:bg-cream-100"
                      >
                        <Sparkles size={14} className="text-sun-600" />
                        <span>Opieka i subskrypcja</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-cream-200 mt-1 pt-2 min-h-[40px] focus-visible:outline-none focus-visible:bg-rose-50"
                      >
                        <LogOut size={14} />
                        <span>Wyloguj się</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              aria-label="Spotkaj się z przyjacielem - rozpocznij relację"
              className="hearth-button flex items-center gap-2 text-xs font-sans font-semibold px-5 py-3 min-h-[44px] rounded-full active:scale-95 transition-all shadow-md shadow-sun-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
            >
              <Heart size={14} />
              <span>Spotkaj się z przyjacielem</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
