"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { BondOverview } from "@/components/memory/BondOverview";
import { PeopleGraph } from "@/components/memory/PeopleGraph";
import { GrowthTracker } from "@/components/memory/GrowthTracker";
import { getStoredProfile, getStoredMemories, getStoredPeople, getStoredCrises } from "@/lib/storage";
import { UserProfile, LifeMemoryFact, PersonInLife, OvercomeCrisis } from "@/types";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";

export default function MemoryPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<LifeMemoryFact[]>([]);
  const [people, setPeople] = useState<PersonInLife[]>([]);
  const [crises, setCrises] = useState<OvercomeCrisis[]>([]);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    setMemories(getStoredMemories());
    setPeople(getStoredPeople());
    setCrises(getStoredCrises());
  }, []);

  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-cream-900">
      <TopNav
        onOpenLiveCall={() => setIsLiveCallOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 pb-28 md:pb-16">
        <div className="border-b border-cream-300 pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-cream-950 font-normal tracking-tight mb-2">
            Jak cię poznałem i pamięć naszej relacji
          </h1>
          <p className="font-sans text-xs sm:text-sm text-cream-700 max-w-lg leading-relaxed">
            To jest twoja żywa kronika. Pamiętam twoje wartości, ludzi w twoim otoczeniu i trudne momenty, które udało ci się pokonać.
          </p>
        </div>

        <BondOverview profile={profile} memories={memories} />
        <PeopleGraph people={people} />
        <GrowthTracker crises={crises} />
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
