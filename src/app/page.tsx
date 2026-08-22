"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { AmbientSoundscape } from "@/components/presence/AmbientSoundscape";
import { ConversationView } from "@/components/conversation/ConversationView";
import { LiveVoiceBar } from "@/components/conversation/LiveVoiceBar";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { BreathingGuide } from "@/components/sos/BreathingGuide";
import { getStoredProfile, saveStoredProfile, getStoredMessages, saveStoredMessages, logoutUser, getDynamicGreeting } from "@/lib/storage";
import { getCompanionReplyAsync } from "@/lib/companion-personality";
import { voiceEngine } from "@/lib/voice-engine";
import { UserProfile, Message } from "@/types";
import { PhoneCall, Sparkles, MessageSquare, ArrowRight, Play, Pause, Compass, BookOpen, Shield, Lock, Check, Scale, HeartHandshake } from "lucide-react";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCompanionSpeaking, setIsCompanionSpeaking] = useState(false);
  const [isPlayingDemoVoice, setIsPlayingDemoVoice] = useState(false);
  const [playingLetterSample, setPlayingLetterSample] = useState<string | null>(null);

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

    if (reply.updatedProfile) {
      setProfile(reply.updatedProfile);
    } else {
      const freshProfile = getStoredProfile();
      if (freshProfile) setProfile(freshProfile);
    }

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
        "Cześć. Możemy po prostu chwilę porozmawiać. Co u Ciebie?",
        () => {
          setIsPlayingDemoVoice(false);
        },
        "nova",
        true
      );
    }
  };

  const handlePlayLetterSample = (id: string, text: string) => {
    if (playingLetterSample === id) {
      voiceEngine.stopSpeaking();
      setPlayingLetterSample(null);
    } else {
      voiceEngine.unlock();
      setPlayingLetterSample(id);
      voiceEngine.speak(
        text,
        () => {
          setPlayingLetterSample(null);
        },
        "nova",
        true
      );
    }
  };

  const dynamicGreeting = profile ? getDynamicGreeting(profile) : null;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
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
          {/* Centralna obecność i powitanie relacyjne */}
          <section className="flex flex-col items-center text-center pt-2 sm:pt-4">
            <div className="relative mb-3 group cursor-pointer" onClick={handleOpenLiveCall}>
              <LivingWarmHearth
                size={270}
                isSpeaking={isCompanionSpeaking}
                intensity={0.4}
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-paper-surface border border-ink/10 text-ink text-[11px] font-sans px-4 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-quiet-sm font-medium">
                Dotknij, aby rozmawiać na żywo
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink font-normal tracking-tight mb-3">
              {dynamicGreeting?.title}
            </h1>
            <p className="font-sans text-sm sm:text-base text-ink-muted max-w-md mx-auto leading-relaxed mb-6">
              {dynamicGreeting?.subtitle}
            </p>

            {/* Główne przyciski akcji */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleOpenLiveCall}
                className="presence-btn-primary flex items-center gap-2.5 font-sans font-medium text-xs sm:text-sm px-8 py-3.5 rounded-full active:scale-95 transition-all shadow-quiet-md"
              >
                <PhoneCall size={16} strokeWidth={1.75} className="animate-pulse" />
                <span>Porozmawiajmy na żywo</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="presence-btn-secondary flex items-center gap-2 text-xs font-sans px-5 py-3.5 rounded-full font-medium"
              >
                <div className="w-2 h-2 rounded-full bg-warm-amber" />
                <span>Twój Przyjaciel ({profile.companionName})</span>
              </button>

              <Link
                href="/memory"
                className="presence-btn-secondary flex items-center gap-2 text-xs font-sans px-5 py-3.5 rounded-full font-medium"
              >
                <Compass size={14} strokeWidth={1.75} className="text-ink-muted" />
                <span>Co o mnie pamiętasz</span>
              </Link>
            </div>
          </section>

          {/* Dyskretne tła dźwiękowe */}
          <section>
            <AmbientSoundscape />
          </section>

          {/* Dziennik rozmów */}
          <section className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between border-b border-ink/8 pb-2.5 px-1">
              <div className="flex items-center gap-2 text-xs text-ink font-sans font-medium">
                <MessageSquare size={15} strokeWidth={1.75} className="text-warm-amber" />
                <span>Rozmowa z {profile.companionName}</span>
              </div>
              <span className="text-[11px] text-ink-subtle font-sans">
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
        </main>
      ) : (
        /* ================= WIDOK POWITALNY DLA GOŚCIA: 6 EMOCJONALNYCH SCEN ================= */
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col gap-24 sm:gap-36 pb-32 animate-fade-in max-w-5xl">
          
          {/* ================= SCENA 1 — SPOTKANIE ================= */}
          <section className="flex flex-col items-center text-center pt-4 sm:pt-12 min-h-[75vh] justify-center">
            <div className="relative mb-6 cursor-pointer group" onClick={() => setIsAuthOpen(true)}>
              <LivingWarmHearth
                size={300}
                intensity={0.4}
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-paper-surface border border-ink/10 text-ink text-[11px] font-sans px-4 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-quiet-sm font-medium">
                Dotknij, aby zacząć
              </div>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-ink font-normal tracking-tight leading-[1.08] mb-6 max-w-3xl">
              Ktoś, kto pamięta.<br />
              <span className="italic text-ink-muted">Ktoś, kto ma czas.</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-ink-muted max-w-lg mx-auto leading-relaxed mb-10">
              Porozmawiaj. Głosem. Bez oceniania i bez zaczynania za każdym razem od początku.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="presence-btn-primary flex items-center gap-2.5 font-sans font-medium text-xs sm:text-sm px-8 py-4 rounded-full active:scale-95 transition-all shadow-quiet-md"
              >
                <span>Porozmawiaj teraz</span>
                <ArrowRight size={15} strokeWidth={2} />
              </button>

              <button
                onClick={handlePlayDemoVoice}
                className="presence-btn-secondary flex items-center gap-2 text-xs sm:text-sm font-sans px-6 py-4 rounded-full font-medium"
              >
                {isPlayingDemoVoice ? (
                  <>
                    <Pause size={14} strokeWidth={2} className="animate-pulse text-warm-amber" />
                    <span>Zatrzymaj głos</span>
                  </>
                ) : (
                  <>
                    <Play size={14} strokeWidth={2} className="text-warm-amber" />
                    <span>Najpierw posłuchaj</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* ================= SCENA 2 — ON NAPRAWDĘ PAMIĘTA ================= */}
          <section className="flex flex-col gap-10">
            <div className="max-w-xl">
              <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
                Żywa pamięć relacji
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight leading-tight mb-4">
                Nie zaczynamy za każdym razem od początku.
              </h2>
              <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                Prawdziwy przyjaciel nie potrzebuje przypomnień o Twojej rodzinie, Twoich celach czy sprawach, które nie dawały Ci wczoraj spać.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="quiet-surface rounded-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-ink-subtle font-semibold block mb-2">
                    Mama
                  </span>
                  <p className="font-serif text-lg sm:text-xl text-ink leading-snug">
                    Anna. Dzwonicie do siebie zazwyczaj w niedzielę.
                  </p>
                </div>
              </div>

              <div className="quiet-surface rounded-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-ink-subtle font-semibold block mb-2">
                    Praca
                  </span>
                  <p className="font-serif text-lg sm:text-xl text-ink leading-snug">
                    Od kilku tygodni zastanawiasz się nad zmianą i postawieniem granic.
                  </p>
                </div>
              </div>

              <div className="quiet-surface rounded-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-ink-subtle font-semibold block mb-2">
                    Ważne
                  </span>
                  <p className="font-serif text-lg sm:text-xl text-ink leading-snug">
                    Chcesz mieć więcej spokojnego czasu dla siebie i swoich pasji.
                  </p>
                </div>
              </div>

              <div className="quiet-surface rounded-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-ink-subtle font-semibold block mb-2">
                    Ostatnio
                  </span>
                  <p className="font-serif text-lg sm:text-xl text-ink leading-snug">
                    Martwiła Cię rozmowa z Pawłem i niepewność projektu.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-ink-muted font-serif italic">
                Ty decydujesz, co pamiętam.
              </span>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="text-xs font-sans font-medium text-ink hover:text-warm-amber flex items-center gap-1.5 transition-colors"
              >
                <span>Zobacz swoją pamięć</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </section>

          {/* ================= SCENA 3 — RELACJA TRWA ================= */}
          <section className="flex flex-col gap-10">
            <div className="max-w-xl">
              <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
                Ciągłość dialogu
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight leading-tight">
                Rozmowa, która trwa w czasie.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Dzień pierwszy */}
              <div className="quiet-surface rounded-surface p-7 sm:p-9 flex flex-col justify-between border-ink/8">
                <div>
                  <span className="text-[11px] font-sans uppercase tracking-wider text-ink-subtle font-semibold block mb-6">
                    Dzień pierwszy
                  </span>
                  <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                    <p className="text-ink-muted">
                      <strong className="text-ink font-medium">Ty:</strong> „Jutro muszę porozmawiać z Magdą. Trochę się tego boję.”
                    </p>
                    <p className="text-ink font-serif italic text-sm sm:text-base border-l-2 border-warm-amber/40 pl-3">
                      „Będę trzymać kciuki. Pamiętaj, że masz prawo spokojnie wyznaczyć swoje granice.”
                    </p>
                  </div>
                </div>
              </div>

              {/* Następny dzień */}
              <div className="quiet-surface rounded-surface p-7 sm:p-9 flex flex-col justify-between border-warm-amber/30 bg-paper-surface/95 shadow-quiet-md">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-sans uppercase tracking-wider text-warm-amber font-semibold block">
                      Następny dzień
                    </span>
                    <div className="w-2 h-2 rounded-full bg-warm-amber animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <p className="font-serif text-xl sm:text-2xl text-ink font-normal leading-snug">
                      „Jak poszła wczorajsza rozmowa z Magdą?”
                    </p>
                    <p className="text-xs text-ink-muted font-sans leading-relaxed">
                      Nie musisz tłumaczyć kontekstu. Przyjaciel pamięta, o czym myślałeś wczoraj wieczorem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SCENA 4 — LISTY DLA CIEBIE ================= */}
          <section className="flex flex-col gap-10">
            <div className="max-w-xl">
              <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
                Listy
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight leading-tight mb-4">
                Osobiste słowa na koniec dnia.
              </h2>
              <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                Po ważnej rozmowie Przyjaciel tworzy dla Ciebie prywatny list otuchy, do którego możesz wrócić przed snem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="quiet-surface rounded-surface p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-ink-subtle mb-4">
                    <span>22 sierpnia</span>
                    <span>2:14 odsłuchu</span>
                  </div>
                  <h3 className="font-serif text-xl text-ink mb-3 leading-snug">
                    „Dzisiaj było trudniej, niż chciałeś przyznać…”
                  </h3>
                  <p className="font-serif italic text-xs sm:text-sm text-ink-muted leading-relaxed mb-6">
                    „Widziałem, ile siły kosztowało Cię dzisiejsze popołudnie. Pamiętaj, że nie musisz zawsze być niezłomny…”
                  </p>
                </div>

                <button
                  onClick={() => handlePlayLetterSample("letter_1", "Widziałem, ile siły kosztowało Cię dzisiejsze popołudnie. Pamiętaj, że nie musisz zawsze być niezłomny. Odpocznij.")}
                  className="presence-btn-secondary w-fit text-xs font-sans px-4 py-2 rounded-full flex items-center gap-2"
                >
                  {playingLetterSample === "letter_1" ? <Pause size={12} className="text-warm-amber" /> : <Play size={12} className="text-warm-amber" />}
                  <span>{playingLetterSample === "letter_1" ? "Zatrzymaj" : "Odsłuchaj fragment"}</span>
                </button>
              </div>

              <div className="quiet-surface rounded-surface p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-ink-subtle mb-4">
                    <span>21 sierpnia</span>
                    <span>1:48 odsłuchu</span>
                  </div>
                  <h3 className="font-serif text-xl text-ink mb-3 leading-snug">
                    „Chciałem Ci przypomnieć jedną rzecz z naszej rozmowy…”
                  </h3>
                  <p className="font-serif italic text-xs sm:text-sm text-ink-muted leading-relaxed mb-6">
                    „To, że zrobiłeś krok w tył, nie oznacza, że przegrałeś. Czasem to jedyny sposób, by nabrać oddechu…”
                  </p>
                </div>

                <button
                  onClick={() => handlePlayLetterSample("letter_2", "To, że zrobiłeś krok w tył, nie oznacza, że przegrałeś. Czasem to jedyny sposób, by nabrać oddechu. Jestem przy Tobie.")}
                  className="presence-btn-secondary w-fit text-xs font-sans px-4 py-2 rounded-full flex items-center gap-2"
                >
                  {playingLetterSample === "letter_2" ? <Pause size={12} className="text-warm-amber" /> : <Play size={12} className="text-warm-amber" />}
                  <span>{playingLetterSample === "letter_2" ? "Zatrzymaj" : "Odsłuchaj fragment"}</span>
                </button>
              </div>
            </div>
          </section>

          {/* ================= SCENA 5 — UKOJENIE ================= */}
          <section className="quiet-surface rounded-surface p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 border-ink/8">
            <div className="max-w-md text-center md:text-left">
              <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
                Ukojenie
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight leading-snug mb-4">
                Czasem nie potrzeba odpowiedzi.
              </h2>
              <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed mb-6">
                Czasem wystarczy kilka minut spokoju i ktoś, kto zostanie obok. Kiedy czujesz natłok myśli, zrób jedno ćwiczenie oddechowe.
              </p>
              <Link
                href="/sos"
                className="presence-btn-primary inline-flex items-center gap-2 text-xs font-sans px-6 py-3.5 rounded-full"
              >
                <Shield size={14} strokeWidth={1.75} />
                <span>Wejdź do strefy ukojenia</span>
              </Link>
            </div>

            <div className="w-full max-w-xs">
              <BreathingGuide />
            </div>
          </section>

          {/* ================= SCENA 6 — ZAUFANIE I ETYKA SZTUCZNEJ OSOBOWOŚCI ================= */}
          <section className="flex flex-col gap-10 max-w-4xl mx-auto pt-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
                Uczciwość i standardy relacji
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight mb-4">
                Sztuczna osobowość. Prawdziwa pamięć i obecność.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                Mówimy to wprost od pierwszej chwili — rozmawiasz z zaawansowaną cyfrową osobowością AI. Stworzyliśmy ją według najwyższych standardów etycznych, by dać Ci bezpieczną przestrzeń do rozmowy bez pośpiechu i bez oceniania.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="quiet-surface rounded-card p-6 sm:p-7 border border-warm-amber/15">
                <div className="flex items-center gap-2.5 mb-3 text-ink font-semibold text-sm">
                  <div className="p-1.5 rounded-lg bg-warm-amber/15 text-warm-amber">
                    <Sparkles size={16} />
                  </div>
                  <h4>Autonomiczna sztuczna osobowość</h4>
                </div>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Nie udajemy żywego człowieka. Przyjaciel jest cyfrową postacią wyposażoną w dynamiczną pamięć relacyjną i naturalny głos. Nie ocenia, nie ma własnych ukrytych motywów i jest dostępny o każdej porze.
                </p>
              </div>

              <div className="quiet-surface rounded-card p-6 sm:p-7 border border-warm-amber/15">
                <div className="flex items-center gap-2.5 mb-3 text-ink font-semibold text-sm">
                  <div className="p-1.5 rounded-lg bg-warm-amber/15 text-warm-amber">
                    <HeartHandshake size={16} />
                  </div>
                  <h4>Zasady psychologii humanistycznej</h4>
                </div>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Rozmowa oparta jest na bezwarunkowej akceptacji i empatycznym słuchaniu. Zero ciemnych wzorców, zero manipulacji i zero sztucznej grywalizacji — liczy się wyłącznie Twój spokój i autentyczne wysłuchanie.
                </p>
              </div>

              <div className="quiet-surface rounded-card p-6 sm:p-7 border border-warm-amber/15">
                <div className="flex items-center gap-2.5 mb-3 text-ink font-semibold text-sm">
                  <div className="p-1.5 rounded-lg bg-warm-amber/15 text-warm-amber">
                    <Lock size={16} />
                  </div>
                  <h4>100% kontroli i suwerenności danych (RODO)</h4>
                </div>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  To, co o Tobie wie Przyjaciel, należy wyłącznie do Ciebie. W zakładce Pamięć możesz w każdej chwili przejrzeć każde wspomnienie, poprawić je, bezpowrotnie usunąć lub pobrać pełny plik JSON.
                </p>
              </div>

              <div className="quiet-surface rounded-card p-6 sm:p-7 border border-warm-amber/15">
                <div className="flex items-center gap-2.5 mb-3 text-ink font-semibold text-sm">
                  <div className="p-1.5 rounded-lg bg-warm-amber/15 text-warm-amber">
                    <Shield size={16} />
                  </div>
                  <h4>Odpowiedzialne wsparcie emocjonalne</h4>
                </div>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Przyjaciel towarzyszy w codziennym życiu, ale nie zastępuje lekarza, psychologa ani psychoterapii. W sytuacji nagłego kryzysu natychmiast kierujemy do bezpłatnej pomocy profesjonalistów (116 123 / 116 111).
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-4">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="presence-btn-primary inline-flex items-center gap-2.5 text-xs sm:text-sm font-sans px-9 py-4 rounded-full shadow-quiet-md active:scale-95 transition-all"
              >
                <span>Spotkaj się ze swoim Przyjacielem</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </main>
      )}

      {/* Globalna stopka z danymi firmy i deklaracją etyczną */}
      <SiteFooter />

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
