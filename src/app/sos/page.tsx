"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { BreathingGuide } from "@/components/sos/BreathingGuide";
import { GroundingExercise } from "@/components/sos/GroundingExercise";
import { Phone, HeartHandshake, ShieldAlert } from "lucide-react";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { getStoredProfile } from "@/lib/storage";

export default function SOSPage() {
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const profile = getStoredProfile();

  return (
    <div className="min-h-screen flex flex-col bg-sanctuary-950 text-sanctuary-100">
      <TopNav onOpenLiveCall={() => setIsLiveCallOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 pb-28 md:pb-16">
        <div className="border-b border-sanctuary-800 pb-4">
          <div className="flex items-center gap-2 text-rosewood-400 text-xs font-sans uppercase tracking-wider mb-1">
            <ShieldAlert size={16} />
            <span>Strefa natychmiastowego ukojenia</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-sanctuary-50 font-normal tracking-tight mb-2">
            Oddychaj powoli. Jestem przy tobie
          </h1>
          <p className="font-sans text-xs sm:text-sm text-sanctuary-400 max-w-lg leading-relaxed">
            Kiedy lęk lub napięcie stają się przytłaczające, twoje ciało potrzebuje prostych, fizjologicznych sygnałów bezpieczeństwa.
          </p>
        </div>

        <BreathingGuide />
        <GroundingExercise />

        {/* Ważne numery wsparcia */}
        <div className="sanctuary-card rounded-3xl p-6 border border-sanctuary-800 bg-sanctuary-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-rosewood-600/20 text-rosewood-400">
              <Phone size={18} />
            </div>
            <div>
              <h3 className="font-serif text-base text-sanctuary-100 font-medium">
                Bezpłatne całodobowe linie wsparcia psychologicznego
              </h3>
              <p className="font-sans text-xs text-sanctuary-400">
                Jeśli czujesz, że potrzebujesz natychmiastowej rozmowy z człowiekiem
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans mt-4">
            <div className="p-3.5 rounded-xl bg-sanctuary-950 border border-sanctuary-800 flex items-center justify-between">
              <div>
                <span className="text-sanctuary-300 font-medium block">Kryzys emocjonalny (dorosli)</span>
                <span className="text-hearth-300 font-serif text-base font-medium">116 123</span>
              </div>
              <span className="text-[10px] text-sanctuary-500">24/7 bezpłatnie</span>
            </div>

            <div className="p-3.5 rounded-xl bg-sanctuary-950 border border-sanctuary-800 flex items-center justify-between">
              <div>
                <span className="text-sanctuary-300 font-medium block">Dzieci i młodzież</span>
                <span className="text-hearth-300 font-serif text-base font-medium">116 111</span>
              </div>
              <span className="text-[10px] text-sanctuary-500">24/7 bezpłatnie</span>
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
    </div>
  );
}
