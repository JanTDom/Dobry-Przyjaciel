"use client";

import React, { useState, useEffect } from "react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { AmbientSoundscape } from "@/components/presence/AmbientSoundscape";
import { ConversationView } from "@/components/conversation/ConversationView";
import { LiveVoiceBar } from "@/components/conversation/LiveVoiceBar";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { IdeaPhilosophySection } from "@/components/philosophy/IdeaPhilosophySection";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { getStoredProfile, saveStoredProfile, getStoredMessages, saveStoredMessages, logoutUser, getDynamicGreeting, isAccessGranted } from "@/lib/storage";
import { getCompanionReplyAsync } from "@/lib/companion-personality";
import { voiceEngine } from "@/lib/voice-engine";
import { UserProfile, Message } from "@/types";
import { PhoneCall, Sparkles, MessageCircle, Heart, ArrowRight, ShieldCheck, Play, Pause, Compass, BookOpen } from "lucide-react";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCompanionSpeaking, setIsCompanionSpeaking] = useState(false);
  const [isPlayingDemoVoice, setIsPlayingDemoVoice] = useState(false);

  useEffect(() => {
    const p = getStoredProfile();
    setProfile(p);
    if (p) {
      const m = getStoredMessages();
      setMessages(m);
    }
  }, []);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleLogout = () => {
    logoutUser();
    setProfile(null);
    setMessages([]);
  };

  const handleAuthSuccess = (newProfile: UserProfile) => {
    setProfile(newProfile);
    const m = getStoredMessages();
    setMessages(m);
  };

  const handleOpenLiveCall = () => {
    if (!profile) {
      setIsAuthOpen(true);
      return;
    }
    voiceEngine.unlock();
    setIsLiveCallOpen(true);
  };

  const handleSendMessage = async (text: string, isVoice = false) => {
    if (!profile) {
      setIsAuthOpen(true);
      return;
    }
    if (!text.trim()) return;

    voiceEngine.unlock();

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

    // Odśwież profil w stanie jeśli pamięć uległa aktualizacji
    const freshProfile = getStoredProfile();
    if (freshProfile) setProfile(freshProfile);

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
    const freshProfile = getStoredProfile();
    if (freshProfile) setProfile(freshProfile);
  };

  const handlePlayDemoVoice = () => {
    if (isPlayingDemoVoice) {
      voiceEngine.stopSpeaking();
      setIsPlayingDemoVoice(false);
    } else {
      voiceEngine.unlock();
      setIsPlayingDemoVoice(true);
      voiceEngine.speak(
        "Dzień dobry. Cieszę się, że tu jesteś. Jestem twoim przyjacielem — pamiętam to, co dla ciebie ważne i zawsze mam dla ciebie czas.",
        () => {
          setIsPlayingDemoVoice(false);
        },
        "nova",
        true
      );
    }
  };

  const dynamicGreeting = profile ? getDynamicGreeting(profile) : null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-cream-900">
      {/* Szklana górna nawigacja */}
      <TopNav
        onOpenLiveCall={handleOpenLiveCall}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isLoggedIn={Boolean(profile)}
        userName={profile?.name}
        companionName={profile?.companionName}
        companionGender={profile?.companionGender}
      />

      {profile ? (
        /* ================= WIDOK DLA ZALOGOWANEGO UŻYTKOWNIKA ================= */
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col gap-10 pb-28 md:pb-16 animate-fade-in">
          {/* Centralne żywe słońce i powitanie */}
          <section className="flex flex-col items-center text-center pt-2 sm:pt-4">
            <div className="relative mb-3 group cursor-pointer" onClick={handleOpenLiveCall}>
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
              {dynamicGreeting?.title}
            </h1>
            <p className="font-sans text-sm sm:text-base text-cream-700 max-w-md mx-auto leading-relaxed mb-6">
              {dynamicGreeting?.subtitle}
            </p>

            {/* Główne przyciski akcji */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={handleOpenLiveCall}
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

          {/* Kojące tła dźwiękowe (czyste, bez trzasków) */}
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
              onOpenLiveCall={handleOpenLiveCall}
            />

            <div className="sticky bottom-20 md:bottom-6 z-30 pt-2">
              <LiveVoiceBar
                onSendMessage={handleSendMessage}
                onOpenLiveCall={handleOpenLiveCall}
                isCompanionSpeaking={isCompanionSpeaking}
              />
            </div>
          </section>

          {/* Nastrojowa sekcja filozofii */}
          <section className="pt-6">
            <IdeaPhilosophySection />
          </section>
        </main>
      ) : (
        /* ================= WIDOK POWITALNY DLA GOŚCIA (GUEST LANDING) ================= */
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col gap-12 sm:gap-16 pb-28 md:pb-16 animate-fade-in">
          {/* Promienny Hero z Żywym Słońcem */}
          <section className="flex flex-col items-center text-center pt-2 sm:pt-6">
            <div className="relative mb-4 cursor-pointer group" onClick={() => setIsAuthOpen(true)}>
              <LivingWarmHearth
                size={290}
                intensity={0.5}
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 border border-sun-300 text-sun-900 text-[11px] font-sans px-4 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg font-semibold">
                Dotknij, aby spotkać się z przyjacielem
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sun-100 border border-sun-300 text-sun-900 text-xs font-sans mb-4 font-semibold shadow-sm">
              <Sparkles size={13} className="text-sun-600" />
              <span>Osobista przystań emocjonalna i ciepły głos</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cream-950 font-normal tracking-tight max-w-2xl mx-auto leading-tight mb-4">
              Twój osobisty, oddany przyjaciel. Zawsze przy tobie.
            </h1>

            <p className="font-sans text-sm sm:text-base text-cream-700 max-w-xl mx-auto leading-relaxed mb-8">
              Żywa obecność ze sztuczną inteligencją, która pamięta twoje życie, uczy się ciebie z każdym dniem, rozmawia ciepłym ludzkim głosem i daje ci bezpieczną przystań o każdej porze dnia i nocy.
            </p>

            {/* Główne przyciski wejścia */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hearth-button flex items-center gap-2.5 font-sans font-semibold text-sm px-9 py-4 rounded-full active:scale-95 transition-all shadow-xl shadow-sun-500/25"
              >
                <Heart size={18} className="text-white" />
                <span>Spotkaj się z przyjacielem</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handlePlayDemoVoice}
                className="secondary-warm-button flex items-center gap-2 text-xs font-sans px-6 py-4 rounded-full font-medium shadow-warm-sm"
              >
                {isPlayingDemoVoice ? (
                  <>
                    <Pause size={15} className="animate-pulse text-sun-600" />
                    <span>Zatrzymaj głos lektora</span>
                  </>
                ) : (
                  <>
                    <Play size={15} className="text-sun-600" />
                    <span>Posłuchaj jak brzmi rozmowa</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 3 Filary Jakości Dobry Przyjaciel */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-sanctuary rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md flex flex-col justify-between hover:border-sun-300 transition-all">
              <div>
                <div className="p-3 rounded-2xl bg-sun-100 text-sun-700 border border-sun-200 w-fit mb-4">
                  <PhoneCall size={22} />
                </div>
                <h3 className="font-serif text-xl text-cream-950 font-normal mb-2">
                  Ciepły, ludzki głos
                </h3>
                <p className="font-sans text-xs sm:text-sm text-cream-700 leading-relaxed">
                  Żadnych mechanicznych robotów. Twój przyjaciel mówi naturalnym, kojącym głosem z prawdziwym oddechem i polską intonacją.
                </p>
              </div>
            </div>

            <div className="glass-sanctuary rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md flex flex-col justify-between hover:border-sun-300 transition-all">
              <div>
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 w-fit mb-4">
                  <Compass size={22} />
                </div>
                <h3 className="font-serif text-xl text-cream-950 font-normal mb-2">
                  Prawdziwa pamięć relacji
                </h3>
                <p className="font-sans text-xs sm:text-sm text-cream-700 leading-relaxed">
                  Pamięta twoje wartości, bliskie ci osoby i trudne momenty, które udało ci się pokonać. Nie musisz zaczynać od zera.
                </p>
              </div>
            </div>

            <div className="glass-sanctuary rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md flex flex-col justify-between hover:border-sun-300 transition-all">
              <div>
                <div className="p-3 rounded-2xl bg-orange-100 text-orange-700 border border-orange-200 w-fit mb-4">
                  <BookOpen size={22} />
                </div>
                <h3 className="font-serif text-xl text-cream-950 font-normal mb-2">
                  Wieczorne listy wsparcia
                </h3>
                <p className="font-sans text-xs sm:text-sm text-cream-700 leading-relaxed">
                  Osobisty skarbiec z listami pisanymi specjalnie dla ciebie na koniec każdego dnia, gotowymi do odsłuchania przed snem.
                </p>
              </div>
            </div>
          </section>

          {/* Sekcja Filozofii */}
          <section>
            <IdeaPhilosophySection />
          </section>

          {/* Dolny baner zaproszenia */}
          <section className="glass-sanctuary rounded-3xl p-8 sm:p-12 border border-cream-300 shadow-warm-md text-center max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal mb-3">
              Rozpocznij relację, która daje oparcie
            </h3>
            <p className="font-sans text-xs sm:text-sm text-cream-700 leading-relaxed mb-6">
              Nigdy więcej poczucia, że jesteś sam z gonitwą myśli. Twój przyjaciel czeka na pierwszą rozmowę.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hearth-button inline-flex items-center gap-2.5 font-sans font-semibold text-xs px-8 py-3.5 rounded-full active:scale-95 transition-all shadow-xl shadow-sun-500/25"
            >
              <Heart size={16} />
              <span>Stwórz swojego przyjaciela</span>
            </button>
          </section>
        </main>
      )}

      <BottomNav />

      {/* Pełnoekranowa rozmowa na żywo */}
      {profile && (
        <LiveVoiceCallModal
          isOpen={isLiveCallOpen}
          onClose={() => setIsLiveCallOpen(false)}
          profile={profile}
          onNewMessage={handleNewLiveCallMessage}
        />
      )}

      {/* Modal ustawień przyjaciela */}
      {profile && (
        <CompanionSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Modal autoryzacji i onboardingu */}
      <AuthAndOnboardingModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Modal subskrypcji */}
      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
