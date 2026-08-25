"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { BreathingGuide } from "@/components/sos/BreathingGuide";
import { GroundingExercise } from "@/components/sos/GroundingExercise";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { Phone, Shield, Play, Pause, Compass, ArrowLeft } from "lucide-react";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { getStoredProfile, saveStoredProfile, logoutUser } from "@/lib/storage";
import { UserProfile } from "@/types";
import { voiceEngine } from "@/lib/voice-engine";

export default function SOSPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"breath" | "ground" | "voice" | "helpline">("breath");
  const [isPlayingCalmVoice, setIsPlayingCalmVoice] = useState(false);
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
    voiceEngine.startLiveDialogue();
    setIsLiveCallOpen(true);
  };

  const handleToggleCalmVoice = () => {
    if (isPlayingCalmVoice) {
      voiceEngine.stopSpeaking();
      setIsPlayingCalmVoice(false);
    } else {
      voiceEngine.unlock();
      setIsPlayingCalmVoice(true);
      voiceEngine.speak(
        "Jestem przy Tobie. Oddychaj powoli i spokojnie. Nie musisz teraz niczego rozwiązywać ani udowadniać. Zostańmy w tej chwili przez kilka minut.",
        () => {
          setIsPlayingCalmVoice(false);
        },
        profile?.companionVoice || "nova",
        true
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col gap-10 pb-28 md:pb-16 animate-fade-in">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
            Ukojenie
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight leading-tight mb-3">
            Jestem. Zostańmy tutaj przez chwilę.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
            Nie musisz teraz niczego rozwiązywać ani tłumaczyć. Wybierz to, co pomoże Ci złapać oddech.
          </p>
        </div>

        {/* 4 proste, spokojne wybory */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("breath")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all ${
              activeTab === "breath"
                ? "presence-btn-primary"
                : "presence-btn-secondary"
            }`}
          >
            Oddychaj ze mną
          </button>

          <button
            onClick={() => setActiveTab("ground")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all ${
              activeTab === "ground"
                ? "presence-btn-primary"
                : "presence-btn-secondary"
            }`}
          >
            Rozejrzyj się wokół
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all ${
              activeTab === "voice"
                ? "presence-btn-primary"
                : "presence-btn-secondary"
            }`}
          >
            Posłuchaj głosu
          </button>

          <button
            onClick={() => setActiveTab("helpline")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all ${
              activeTab === "helpline"
                ? "presence-btn-primary"
                : "presence-btn-secondary"
            }`}
          >
            Pomoc człowieka
          </button>
        </div>

        {/* Zawartość wybranego trybu */}
        <div className="w-full">
          {activeTab === "breath" && (
            <div className="flex flex-col items-center animate-fade-in">
              <BreathingGuide />
            </div>
          )}

          {activeTab === "ground" && (
            <div className="animate-fade-in">
              <GroundingExercise />
            </div>
          )}

          {activeTab === "voice" && (
            <div className="quiet-surface rounded-surface p-8 sm:p-12 text-center max-w-lg mx-auto flex flex-col items-center animate-fade-in">
              <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed italic mb-8">
                „Jestem przy Tobie. Oddychaj powoli i spokojnie. Nie musisz teraz niczego rozwiązywać ani udowadniać. Zostańmy w tej chwili przez kilka minut.”
              </p>

              <button
                onClick={handleToggleCalmVoice}
                className="presence-btn-primary flex items-center gap-2 text-xs font-sans px-7 py-3.5 rounded-full"
              >
                {isPlayingCalmVoice ? (
                  <>
                    <Pause size={14} className="animate-pulse text-warm-amber" />
                    <span>Zatrzymaj</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="text-warm-amber" />
                    <span>Odsłuchaj słowa ukojenia</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === "helpline" && (
            <div className="quiet-surface rounded-surface p-7 sm:p-9 flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto border-ink/8">
              <div>
                <h3 className="font-serif text-xl text-ink font-normal mb-1">
                  Bezpłatne całodobowe linie wsparcia i pomoc specjalistyczna
                </h3>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Jeśli przeżywasz trudny kryzys, zmagasz się z nałogiem, fobią lub potrzebujesz natychmiastowej rozmowy z człowiekiem i specjalistą:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                <a
                  href="tel:116123"
                  className="p-4 rounded-card bg-paper-dark/60 border border-ink/8 flex items-center justify-between hover:border-warm-amber/40 transition-colors group"
                >
                  <div>
                    <span className="text-ink-muted block text-[11px]">Dorośli w kryzysie emocjonalnym</span>
                    <span className="text-ink font-serif text-lg font-semibold group-hover:text-warm-amber transition-colors">
                      116 123
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium">
                    24/7 bezpłatnie
                  </span>
                </a>

                <a
                  href="tel:224848801"
                  className="p-4 rounded-card bg-paper-dark/60 border border-ink/8 flex items-center justify-between hover:border-warm-amber/40 transition-colors group"
                >
                  <div>
                    <span className="text-ink-muted block text-[11px]">Antydepresyjny Telefon Zaufania (ITAKA)</span>
                    <span className="text-ink font-serif text-lg font-semibold group-hover:text-warm-amber transition-colors">
                      22 484 88 01
                    </span>
                  </div>
                  <span className="text-[10px] text-warm-amber bg-warm-amber/10 px-2 py-0.5 rounded-full font-medium">
                    Specjaliści
                  </span>
                </a>

                <a
                  href="tel:800199990"
                  className="p-4 rounded-card bg-paper-dark/60 border border-ink/8 flex items-center justify-between hover:border-warm-amber/40 transition-colors group"
                >
                  <div>
                    <span className="text-ink-muted block text-[11px]">Telefon Zaufania – Uzależnienia (Narkomania/Inne)</span>
                    <span className="text-ink font-serif text-lg font-semibold group-hover:text-warm-amber transition-colors">
                      800 199 990
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium">
                    Codziennie 16-22
                  </span>
                </a>

                <a
                  href="tel:801889880"
                  className="p-4 rounded-card bg-paper-dark/60 border border-ink/8 flex items-center justify-between hover:border-warm-amber/40 transition-colors group"
                >
                  <div>
                    <span className="text-ink-muted block text-[11px]">Uzależnienia behawioralne (hazard, sieć)</span>
                    <span className="text-ink font-serif text-lg font-semibold group-hover:text-warm-amber transition-colors">
                      801 889 880
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium">
                    Codziennie 17-22
                  </span>
                </a>

                <a
                  href="tel:116111"
                  className="p-4 rounded-card bg-paper-dark/60 border border-ink/8 flex items-center justify-between hover:border-warm-amber/40 transition-colors group"
                >
                  <div>
                    <span className="text-ink-muted block text-[11px]">Dzieci i młodzież</span>
                    <span className="text-ink font-serif text-lg font-semibold group-hover:text-warm-amber transition-colors">
                      116 111
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium">
                    24/7 bezpłatnie
                  </span>
                </a>

                <a
                  href="tel:112"
                  className="p-4 rounded-card bg-rose-50/70 border border-rose-200 flex items-center justify-between hover:border-rose-400 transition-colors group"
                >
                  <div>
                    <span className="text-rose-700 block text-[11px]">Nagłe bezpośrednie zagrożenie życia</span>
                    <span className="text-rose-900 font-serif text-lg font-semibold">
                      112
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-full font-medium">
                    Numer alarmowy
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
}
