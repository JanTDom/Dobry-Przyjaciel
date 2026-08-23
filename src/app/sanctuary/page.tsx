"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { VictoryVault } from "@/components/sanctuary/VictoryVault";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { getStoredProfile, saveStoredProfile, logoutUser } from "@/lib/storage";
import { UserProfile } from "@/types";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { voiceEngine } from "@/lib/voice-engine";
import { BookOpen, Sparkles } from "lucide-react";

export default function SanctuaryPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleLogout = () => {
    logoutUser();
    setProfile(null);
  };

  const handleOpenLiveCall = () => {
    if (!profile) {
      setIsAuthOpen(true);
      return;
    }
    voiceEngine.unlock();
    setIsLiveCallOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <TopNav
        onOpenLiveCall={handleOpenLiveCall}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isLoggedIn={Boolean(profile)}
        userName={profile?.name}
        companionName={profile?.companionName}
        companionGender={profile?.companionGender}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col gap-10 pb-28 md:pb-16 animate-fade-in">
        <div className="max-w-2xl">
          <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
            Prywatna korespondencja
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight leading-tight mb-3">
            Listy od Twojego Przyjaciela.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
            Wracaj do tych słów zawsze, kiedy poczujesz zwątpienie, zmęczenie lub samotność. Zostały napisane specjalnie dla Ciebie na podstawie Twoich przeżyć.
          </p>
        </div>

        {profile ? (
          <VictoryVault />
        ) : (
          <div className="quiet-surface rounded-surface p-10 sm:p-14 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-paper-dark flex items-center justify-center text-warm-amber mb-4">
              <BookOpen size={22} strokeWidth={1.75} />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
              Pierwszy list jeszcze przed nami.
            </h2>

            <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed mb-8 max-w-sm">
              Stwórz relację ze swoim Przyjacielem, aby otrzymać osobisty list powitalny i tworzyć dedykowane słowa wsparcia na każdy wieczór.
            </p>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="presence-btn-primary inline-flex items-center gap-2 text-xs font-sans px-7 py-3.5 rounded-full active:scale-95 shadow-quiet-sm transition-all"
            >
              <Sparkles size={14} className="text-warm-honey" />
              <span>Spotkaj się z Przyjacielem</span>
            </button>
          </div>
        )}
      </main>

      <SiteFooter />

      <BottomNav />

      {profile && (
        <LiveVoiceCallModal
          isOpen={isLiveCallOpen}
          onClose={() => setIsLiveCallOpen(false)}
          profile={profile}
          onNewMessage={() => {}}
        />
      )}

      {profile && (
        <CompanionSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      <AuthAndOnboardingModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(p) => setProfile(p)}
      />

      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
