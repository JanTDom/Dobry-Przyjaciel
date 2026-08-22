"use client";

import React, { useState, useEffect } from "react";
import { VictoryVault } from "@/components/sanctuary/VictoryVault";
import { getStoredProfile, INITIAL_USER_PROFILE } from "@/lib/storage";
import { UserProfile } from "@/types";
import { BookOpen, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SanctuaryPage() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Powrót do Przyjaciela</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-calmTeal-400" />
          Skarbiec Zwycięstw & Listy Wsparcia
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Prywatne listy i przypomnienia od {profile.companionName}, które pozwalają odzyskać grunt pod nogami.
        </p>
      </div>

      <VictoryVault profile={profile} />
    </div>
  );
}
