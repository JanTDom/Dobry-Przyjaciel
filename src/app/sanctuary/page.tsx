"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { VictoryVault } from "@/components/sanctuary/VictoryVault";
import { getStoredProfile } from "@/lib/storage";
import { UserProfile } from "@/types";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";

export default function SanctuaryPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-sanctuary-950 text-sanctuary-100">
      <TopNav
        onOpenLiveCall={() => setIsLiveCallOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 pb-28 md:pb-16">
        <div className="border-b border-sanctuary-800 pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-sanctuary-50 font-normal tracking-tight mb-2">
            Skarbiec twojej siły i listy wsparcia
          </h1>
          <p className="font-sans text-xs sm:text-sm text-sanctuary-400 max-w-lg leading-relaxed">
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

      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
