"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { VictoryVault } from "@/components/sanctuary/VictoryVault";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { getStoredProfile, saveStoredProfile, logoutUser } from "@/lib/storage";
import { UserProfile } from "@/types";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { voiceEngine } from "@/lib/voice-engine";
import { BookOpen, Heart } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-cream-100 text-cream-900">
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 pb-28 md:pb-16 animate-fade-in">
        <div className="border-b border-cream-300 pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-cream-950 font-normal tracking-tight mb-2">
            Skarbiec twojej siły i listy wsparcia
          </h1>
          <p className="font-sans text-xs sm:text-sm text-cream-700 max-w-lg leading-relaxed">
            Wracaj do tych słów zawsze, kiedy poczujesz zwątpienie, zmęczenie lub samotność. Zostały napisane specjalnie dla ciebie.
          </p>
        </div>

        {profile ? (
          <VictoryVault />
        ) : (
          <div className="glass-sanctuary rounded-3xl p-8 sm:p-12 border border-cream-300 shadow-warm-md text-center max-w-lg mx-auto">
            <div className="inline-flex p-3.5 rounded-2xl bg-sun-100 text-sun-700 border border-sun-300 mb-4 shadow-sm">
              <BookOpen size={24} />
            </div>
            <h3 className="font-serif text-2xl text-cream-950 font-normal mb-2">
              Twój osobisty skarbiec listów
            </h3>
            <p className="font-sans text-xs text-cream-600 leading-relaxed mb-6">
              Stwórz swojego przyjaciela, aby otrzymać osobisty list powitalny i tworzyć dedykowane listy wsparcia na każdy wieczór.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hearth-button inline-flex items-center gap-2 font-sans font-semibold text-xs px-7 py-3 rounded-full"
            >
              <Heart size={15} />
              <span>Spotkaj się z przyjacielem</span>
            </button>
          </div>
        )}
      </main>

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
