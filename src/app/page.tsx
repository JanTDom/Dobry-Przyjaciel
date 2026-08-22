"use client";

import React, { useState, useEffect } from "react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { AmbientSoundscape } from "@/components/presence/AmbientSoundscape";
import { ConversationView } from "@/components/conversation/ConversationView";
import { LiveVoiceBar } from "@/components/conversation/LiveVoiceBar";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { IdeaPhilosophySection } from "@/components/philosophy/IdeaPhilosophySection";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { getStoredProfile, saveStoredProfile, getStoredMessages, saveStoredMessages, getInitialSeedMessages } from "@/lib/storage";
import { getCompanionReplyAsync } from "@/lib/companion-personality";
import { voiceEngine } from "@/lib/voice-engine";
import { UserProfile, Message } from "@/types";
import { PhoneCall, Sparkles, MessageCircle, SlidersHorizontal, Compass } from "lucide-react";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCompanionSpeaking, setIsCompanionSpeaking] = useState(false);

  useEffect(() => {
    const p = getStoredProfile();
    const m = getStoredMessages();
    setProfile(p);
    setMessages(m.length > 0 ? m : getInitialSeedMessages());
  }, []);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleSendMessage = async (text: string, isVoice = false) => {
    if (!profile || !text.trim()) return;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      userId: profile.id,
      sender: "user",
      text: text.trim(),
      messageType: isVoice ? "voice" : "text",
      createdAt: new Date().toISOString(),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    saveStoredMessages(updatedWithUser);

    const reply = await getCompanionReplyAsync(text, profile, updatedWithUser);
    const companionMsg: Message = {
      id: "msg_" + (Date.now() + 1),
      userId: profile.id,
      sender: "companion",
      text: reply.text,
      messageType: isVoice ? "voice" : "text",
      moodContext: reply.moodContext,
      createdAt: new Date().toISOString(),
    };

    const updatedWithCompanion = [...updatedWithUser, companionMsg];
    setMessages(updatedWithCompanion);
    saveStoredMessages(updatedWithCompanion);

    if (isVoice) {
      setIsCompanionSpeaking(true);
      voiceEngine.speak(
        reply.text,
        () => {
          setIsCompanionSpeaking(false);
        },
        profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova")
      );
    }
  };

  const handleNewLiveCallMessage = (msg: Message) => {
    setMessages((prev) => {
      const updated = [...prev, msg];
      saveStoredMessages(updated);
      return updated;
    });
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-cream-900">
      {/* Górna nawigacja szklana */}
      <TopNav
        onOpenLiveCall={() => setIsLiveCallOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        companionName={profile.companionName}
        companionGender={profile.companionGender}
      />

      {/* Główna nastrojowa przystań */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col gap-10 pb-28 md:pb-16">
        {/* Centralne przywitanie i żywe słoneczne światło obecności */}
        <section className="flex flex-col items-center text-center pt-2 sm:pt-4">
          <div className="relative mb-3 group cursor-pointer" onClick={() => setIsLiveCallOpen(true)}>
            <LivingWarmHearth
              size={260}
              isSpeaking={isCompanionSpeaking}
              intensity={0.45}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 border border-sun-300 text-sun-900 text-[11px] font-sans px-4 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg font-semibold">
              Dotknij, aby rozmawiać na żywo
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-950 font-normal tracking-tight mb-3">
            Witaj, {profile.name}. Jak się dzisiaj czujesz?
          </h1>
          <p className="font-sans text-sm sm:text-base text-cream-700 max-w-md mx-auto leading-relaxed mb-6">
            Jestem {profile.companionName}, twoim osobistym przyjacielem. Uczę się ciebie każdego dnia, pamiętam to, co ważne i zawsze mam dla ciebie czas.
          </p>

          {/* Główne przyciski akcji */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setIsLiveCallOpen(true)}
              className="hearth-button flex items-center gap-2.5 font-sans font-semibold text-sm px-8 py-3.5 rounded-full active:scale-95 transition-all shadow-xl shadow-sun-500/25"
            >
              <PhoneCall size={18} className="animate-pulse" />
              <span>Porozmawiajmy na żywo</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="secondary-warm-button flex items-center gap-2 text-xs font-sans px-5 py-3.5 rounded-full font-medium"
            >
              <span>{profile.companionGender === "male" ? "👨" : "👩"}</span>
              <span>Twój przyjaciel ({profile.companionName})</span>
            </button>

            <button
              onClick={() => setIsPricingOpen(true)}
              className="secondary-warm-button flex items-center gap-2 text-xs font-sans px-5 py-3.5 rounded-full font-medium"
            >
              <Sparkles size={14} className="text-sun-500" />
              <span>Osobista opieka</span>
            </button>
          </div>
        </section>

        {/* Kojące tła dźwiękowe (kominek, letni deszcz, fale oceanu, fale alfa 8Hz) */}
        <section>
          <AmbientSoundscape />
        </section>

        {/* Dziennik rozmów i przemyśleń */}
        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between border-b border-cream-300 pb-2.5 px-1">
            <div className="flex items-center gap-2 text-xs text-cream-700 font-sans font-medium">
              <MessageCircle size={16} className="text-sun-600" />
              <span>Dziennik rozmów z {profile.companionName}</span>
            </div>
            <span className="text-[11px] text-cream-500 font-sans">
              {messages.length} wiadomości
            </span>
          </div>

          <ConversationView
            messages={messages}
            profile={profile}
            onOpenLiveCall={() => setIsLiveCallOpen(true)}
          />

          <div className="sticky bottom-20 md:bottom-6 z-30 pt-2">
            <LiveVoiceBar
              onSendMessage={handleSendMessage}
              onOpenLiveCall={() => setIsLiveCallOpen(true)}
              isCompanionSpeaking={isCompanionSpeaking}
            />
          </div>
        </section>

        {/* Nastrojowa sekcja: Dlaczego powstał Dobry Przyjaciel? */}
        <section className="pt-6">
          <IdeaPhilosophySection />
        </section>
      </main>

      <BottomNav />

      {/* Pełnoekranowa rozmowa na żywo */}
      <LiveVoiceCallModal
        isOpen={isLiveCallOpen}
        onClose={() => setIsLiveCallOpen(false)}
        profile={profile}
        onNewMessage={handleNewLiveCallMessage}
      />

      {/* Modal wyboru i edycji przyjaciela */}
      <CompanionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Modal subskrypcji */}
      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
