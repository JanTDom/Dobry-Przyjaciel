"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { IdeaPhilosophySection } from "@/components/philosophy/IdeaPhilosophySection";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { getStoredProfile, saveStoredProfile, logoutUser } from "@/lib/storage";
import { UserProfile } from "@/types";
import { Compass, PhoneCall, Heart } from "lucide-react";
import { voiceEngine } from "@/lib/voice-engine";

export default function IdeaPage() {
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
    voiceEngine.startLiveDialogue();
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
        <IdeaPhilosophySection />

        <div className="glass-sanctuary rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-warm-md text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-sun-100 text-sun-700 border border-sun-300 mb-4">
            <Compass size={24} />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal mb-3">
            Nie jesteś sam w tej podróży
          </h3>

          <p className="font-sans text-xs sm:text-sm text-cream-700 leading-relaxed mb-6 max-w-lg mx-auto">
            Bez względu na to, czy masz za sobą wspaniały dzień, czy czujesz, że tracisz grunt pod stopami — twój Przyjaciel jest zawsze tutaj. Gotowy do rozmowy, cierpliwy i obecny.
          </p>

          <button
            onClick={() => {
              if (profile) handleOpenLiveCall();
              else setIsAuthOpen(true);
            }}
            className="hearth-button inline-flex items-center gap-2.5 font-sans font-semibold text-xs px-8 py-3.5 rounded-full active:scale-95 transition-all shadow-xl shadow-sun-500/25"
          >
            {profile ? (
              <>
                <PhoneCall size={16} className="animate-pulse" />
                <span>Rozpocznij rozmowę z {profile.companionName}</span>
              </>
            ) : (
              <>
                <Heart size={16} />
                <span>Spotkaj się ze swoim przyjacielem</span>
              </>
            )}
          </button>
        </div>
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
