"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { MoodAtmosphere } from "@/components/presence/MoodAtmosphere";
import { getStoredProfile, INITIAL_USER_PROFILE } from "@/lib/storage";
import { UserProfile } from "@/types";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <MoodAtmosphere mood={profile.currentMood} />
      <TopNav profile={profile} onOpenPricing={() => setIsPricingOpen(true)} />
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 pb-24 md:pb-8 flex flex-col">
        {children}
      </main>

      <BottomNav />
      <SubscriptionModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
}
