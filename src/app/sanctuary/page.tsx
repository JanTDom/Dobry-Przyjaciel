"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { VictoryVault } from "@/components/sanctuary/VictoryVault";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AccessGateModal } from "@/components/auth/AccessGateModal";
import { getStoredProfile, saveStoredProfile, isAccessGranted } from "@/lib/storage";
import { UserProfile } from "@/types";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";

export default function SanctuaryPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleOpenLiveCall = () => {
    if (isAccessGranted()) {
      setIsLiveCallOpen(true);
    } else {
      setIsGateOpen(true);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-cream-900">
      <TopNav
        onOpenLiveCall={handleOpenLiveCall}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        companionName={profile.companionName}
        companionGender={profile.companionGender}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 pb-28 md:pb-16">
        <div className="border-b border-cream-300 pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-cream-950 font-normal tracking-tight mb-2">
            Skarbiec twojej siły i listy wsparcia
          </h1>
          <p className="font-sans text-xs sm:text-sm text-cream-700 max-w-lg leading-relaxed">
            Wracaj do tych słów zawsze, kiedy poczujesz zwątpienie, zmęczenie lub samotność. Zostały napisane specjalnie dla ciebie.
          </p>
        </div>

        <VictoryVault />
      </main>

      <BottomNav />

      <LiveVoiceCallModal
        isOpen={isLiveCallOpen}
        onClose={() => setIsLiveCallOpen(false)}
        profile={profile}
        onNewMessage={() => {}}
      />

      <CompanionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <AccessGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onSuccess={() => setIsLiveCallOpen(true)}
      />

      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
