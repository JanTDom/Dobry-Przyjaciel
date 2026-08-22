"use client";

import React, { useState, useEffect } from "react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { AmbientSoundscape } from "@/components/presence/AmbientSoundscape";
import { ConversationView } from "@/components/conversation/ConversationView";
import { LiveVoiceBar } from "@/components/conversation/LiveVoiceBar";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { getStoredProfile, getStoredMessages, saveStoredMessages, getInitialSeedMessages } from "@/lib/storage";
import { generateCompanionReply } from "@/lib/companion-personality";
import { voiceEngine } from "@/lib/voice-engine";
import { UserProfile, Message } from "@/types";
import { PhoneCall, Sparkles, Heart, Shield, MessageCircle } from "lucide-react";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isCompanionSpeaking, setIsCompanionSpeaking] = useState(false);

  useEffect(() => {
    const p = getStoredProfile();
    const m = getStoredMessages();
    setProfile(p);
    setMessages(m.length > 0 ? m : getInitialSeedMessages());
  }, []);

  const handleSendMessage = (text: string, isVoice = false) => {
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

    // Odpowiedź Przyjaciela
    setTimeout(() => {
      const reply = generateCompanionReply(text, profile, updatedWithUser);
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
        voiceEngine.speak(reply.text, () => {
          setIsCompanionSpeaking(false);
        });
      }
    }, 600);
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
    <div className="min-h-screen flex flex-col bg-sanctuary-950 text-sanctuary-100">
      {/* Górna nawigacja */}
      <TopNav
        onOpenLiveCall={() => setIsLiveCallOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {/* Główna przestrzeń przystani */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 pb-28 md:pb-16">
        {/* Centralne przywitanie i żywe światło obecności */}
        <section className="flex flex-col items-center text-center pt-4 sm:pt-6">
          <div className="relative mb-4 group">
            <LivingWarmHearth
              size={240}
              isSpeaking={isCompanionSpeaking}
              intensity={0.4}
              onClick={() => setIsLiveCallOpen(true)}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-sanctuary-900/90 border border-sanctuary-700 text-hearth-300 text-[11px] font-sans px-3 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              Dotknij, aby rozmawiać na żywo
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-sanctuary-50 font-normal tracking-tight mb-2">
            Witaj, {profile.name}. Jak się dzisiaj czujesz?
          </h1>
          <p className="font-sans text-xs sm:text-sm text-sanctuary-400 max-w-md mx-auto leading-relaxed mb-6">
            Jestem twoim osobistym przyjacielem. Uczę się ciebie każdego dnia, pamiętam to, co ważne i zawsze mam dla ciebie czas.
          </p>

          {/* Główny przycisk akcji: Rozmowa głosowa na żywo */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsLiveCallOpen(true)}
              className="hearth-button flex items-center gap-2.5 text-sanctuary-950 font-sans font-medium text-sm px-7 py-3.5 rounded-full active:scale-95 transition-all shadow-xl shadow-hearth-500/20"
            >
              <PhoneCall size={18} className="animate-pulse" />
              <span>Porozmawiajmy na żywo</span>
            </button>

            <button
              onClick={() => setIsPricingOpen(true)}
              className="flex items-center gap-2 text-xs font-sans text-sanctuary-300 hover:text-sanctuary-100 bg-sanctuary-900/60 hover:bg-sanctuary-850 px-5 py-3 rounded-full border border-sanctuary-800 transition-all"
            >
              <Sparkles size={14} className="text-hearth-400" />
              <span>Osobista opieka</span>
            </button>
          </div>
        </section>

        {/* Kojące tło dźwiękowe (kominek, deszcz, fale alfa) */}
        <section>
          <AmbientSoundscape />
        </section>

        {/* Cicha rozmowa i historia wiadomości */}
        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between border-b border-sanctuary-800/80 pb-2 px-1">
            <div className="flex items-center gap-2 text-xs text-sanctuary-400 font-sans">
              <MessageCircle size={15} className="text-hearth-400" />
              <span>Dziennik rozmów i przemyśleń</span>
            </div>
            <span className="text-[11px] text-sanctuary-500 font-sans">
              {messages.length} wiadomości
            </span>
          </div>

          <ConversationView
            messages={messages}
            profile={profile}
            onOpenLiveCall={() => setIsLiveCallOpen(true)}
          />

          {/* Pasek wpisywania wiadomości */}
          <div className="sticky bottom-20 md:bottom-6 z-30 pt-2">
            <LiveVoiceBar
              onSendMessage={handleSendMessage}
              onOpenLiveCall={() => setIsLiveCallOpen(true)}
              isCompanionSpeaking={isCompanionSpeaking}
            />
          </div>
        </section>
      </main>

      {/* Dolna nawigacja mobilna */}
      <BottomNav />

      {/* Pełnoekranowa rozmowa na żywo */}
      <LiveVoiceCallModal
        isOpen={isLiveCallOpen}
        onClose={() => setIsLiveCallOpen(false)}
        profile={profile}
        onNewMessage={handleNewLiveCallMessage}
      />

      {/* Modal subskrypcji i opieki */}
      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
