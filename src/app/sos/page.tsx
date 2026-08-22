"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { BreathingGuide } from "@/components/sos/BreathingGuide";
import { GroundingExercise } from "@/components/sos/GroundingExercise";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { Phone, ShieldAlert, Heart } from "lucide-react";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { getStoredProfile, saveStoredProfile, logoutUser } from "@/lib/storage";
import { UserProfile } from "@/types";
import { voiceEngine } from "@/lib/voice-engine";

export default function SOSPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
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
          <div className="flex items-center gap-2 text-sun-700 text-xs font-sans uppercase tracking-wider mb-1 font-semibold">
            <ShieldAlert size={16} />
            <span>Strefa natychmiastowego ukojenia</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-cream-950 font-normal tracking-tight mb-2">
            Oddychaj powoli. Jestem przy tobie
          </h1>
          <p className="font-sans text-xs sm:text-sm text-cream-700 max-w-lg leading-relaxed">
            Kiedy lęk lub napięcie stają się przytłaczające, twoje ciało potrzebuje prostych, fizjologicznych sygnałów bezpieczeństwa.
          </p>
        </div>

        <BreathingGuide />
        <GroundingExercise />

        <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-cream-950 font-medium">
                Bezpłatne całodobowe linie wsparcia psychologicznego
              </h3>
              <p className="font-sans text-xs text-cream-600">
                Jeśli czujesz, że potrzebujesz natychmiastowej rozmowy z człowiekiem
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans mt-4">
            <div className="p-4 rounded-2xl bg-white border border-cream-300 flex items-center justify-between shadow-warm-sm">
              <div>
                <span className="text-cream-800 font-medium block">Kryzys emocjonalny (dorośli)</span>
                <span className="text-sun-700 font-serif text-lg font-bold">116 123</span>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">24/7 bezpłatnie</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-cream-300 flex items-center justify-between shadow-warm-sm">
              <div>
                <span className="text-cream-800 font-medium block">Dzieci i młodzież</span>
                <span className="text-sun-700 font-serif text-lg font-bold">116 111</span>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">24/7 bezpłatnie</span>
            </div>
          </div>
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
    </div>
  );
}
