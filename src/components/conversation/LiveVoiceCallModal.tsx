"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, MessageSquare, ArrowLeft, X, ChevronDown, ChevronUp, Compass, Home, Send, Radio, Sparkles } from "lucide-react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { voiceEngine, VoiceEngineState } from "@/lib/voice-engine";
import { getCompanionReplyAsync } from "@/lib/companion-personality";
import { getStoredProfile, getStoredMessages, addStoredMessage } from "@/lib/storage";
import { UserProfile, Message } from "@/types";
import Link from "next/link";

interface LiveVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onNewMessage: (msg: Message) => void;
}

export const LiveVoiceCallModal: React.FC<LiveVoiceCallModalProps> = ({
  isOpen,
  onClose,
  profile: initialProfile,
  onNewMessage,
}) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [drawerInputText, setDrawerInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const durationTimerRef = useRef<any>(null);
  const hasPlayedGreetingRef = useRef(false);
  const isProcessingMessageRef = useRef(false);

  const companionVoice = profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova");

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleCloseModal = () => {
    voiceEngine.stopLiveDialogue();
    voiceEngine.stopSpeaking();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    hasPlayedGreetingRef.current = false;
    isProcessingMessageRef.current = false;
    onClose();
  };

  const processUserMessage = async (userText: string) => {
    if (!userText || userText.trim().length === 0 || isProcessingMessageRef.current) return;

    isProcessingMessageRef.current = true;
    const cleanUserText = userText.trim();
    setIsProcessing(true);
    setErrorMessage(null);

    // Dokładny, dosłowny zapis słów użytkownika wprost
    const userMsg: Message = {
      id: "msg_" + Date.now(),
      userId: profile.id,
      sender: "user",
      text: cleanUserText,
      messageType: "voice",
      createdAt: new Date().toISOString(),
    };

    addStoredMessage(userMsg);
    onNewMessage(userMsg);
    setSessionMessages((prev) => [...prev, userMsg]);

    try {
      const currentFreshProfile = getStoredProfile() || profile;
      const fullHistory = [...sessionMessages];
      const reply = await getCompanionReplyAsync(cleanUserText, currentFreshProfile, fullHistory);

      if (reply.updatedProfile) {
        setProfile(reply.updatedProfile);
      }

      const companionMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        userId: profile.id,
        sender: "companion",
        text: reply.text,
        messageType: "voice",
        moodContext: reply.moodContext,
        createdAt: new Date().toISOString(),
      };

      addStoredMessage(companionMsg);
      onNewMessage(companionMsg);
      setSessionMessages((prev) => [...prev, companionMsg]);

      // Odtwórz głos lektora
      await voiceEngine.speak(
        reply.text,
        () => {
          isProcessingMessageRef.current = false;
        },
        companionVoice
      );
    } catch (e) {
      console.error("Conversation processing error:", e);
      isProcessingMessageRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      voiceEngine.stopLiveDialogue();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      hasPlayedGreetingRef.current = false;
      isProcessingMessageRef.current = false;
      setIsCallEnded(false);
      return;
    }

    voiceEngine.unlock();
    setCallDuration(0);
    setIsCallEnded(false);
    setShowTranscriptDrawer(false);
    setErrorMessage(null);
    hasPlayedGreetingRef.current = false;
    isProcessingMessageRef.current = false;

    // Załaduj ostatnie wiadomości z pamięci
    const stored = getStoredMessages();
    setSessionMessages(stored.slice(-8));

    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    const isFemale = profile.companionGender !== "male";
    const greetingText = `Cześć ${profile.name}. Jestem ${profile.companionName}. Usiądź wygodnie — słucham Cię.`;

    voiceEngine.setCallbacks(
      (capturedText) => {
        processUserMessage(capturedText);
      },
      (state: VoiceEngineState) => {
        setIsListening(state.isListening);
        setIsRecording(state.isRecording);
        setIsSpeaking(state.isSpeaking);
        setIsProcessing(state.isProcessing);
        if (state.errorMessage) {
          setErrorMessage(state.errorMessage);
        }
      }
    );

    // Inicjalizacja mikrofonu i uprawnień od razu przy otwarciu okna
    voiceEngine.startLiveDialogue();

    // Odtwórz powitanie DOKŁADNIE RAZ
    if (!hasPlayedGreetingRef.current) {
      hasPlayedGreetingRef.current = true;
      voiceEngine.speak(
        greetingText,
        undefined,
        companionVoice
      );
    }

    return () => {
      voiceEngine.stopLiveDialogue();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      hasPlayedGreetingRef.current = false;
    };
  }, [isOpen]);

  const handleEndCallClick = () => {
    voiceEngine.stopLiveDialogue();
    voiceEngine.stopSpeaking();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setIsCallEnded(true);
  };

  const handleDrawerSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerInputText.trim()) return;
    const text = drawerInputText.trim();
    setDrawerInputText("");
    processUserMessage(text);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0F0D0A]/95 text-[#FBF8F1] px-4 sm:px-8 py-6 select-none overflow-hidden"
      >
        {/* Spokojne tło */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 38%, rgba(245, 158, 11, 0.08) 0%, rgba(15, 13, 10, 0.95) 100%)",
          }}
        />

        {/* Górny pasek nawigacji */}
        <div className="w-full max-w-2xl flex items-center justify-between z-10">
          <button
            onClick={handleCloseModal}
            className="flex items-center gap-2 text-xs font-sans font-medium text-[#FBF8F1] bg-white/5 hover:bg-white/10 border border-amber-500/25 hover:border-amber-500/50 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95"
            title="Wróć do aplikacji (lub naciśnij ESC)"
          >
            <ArrowLeft size={14} strokeWidth={2} className="text-amber-400" />
            <span>Wróć do aplikacji</span>
          </button>

          {!isCallEnded && (
            <div className="flex items-center gap-2.5 bg-white/5 border border-amber-500/20 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <span className="text-xs text-[#FBF8F1] font-sans font-medium tracking-wide">
                {profile.companionName} • {formatDuration(callDuration)}
              </span>
            </div>
          )}

          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors shadow-lg backdrop-blur-md"
            title="Zamknij (ESC)"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Widok w trakcie rozmowy */}
        {!isCallEnded ? (
          <>
            {/* Centralna żywa obecność – bez nachalnych ścian tekstu */}
            <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg w-full z-10">
              {/* Spokojne, ciepłe palenisko */}
              <div className="relative mb-6">
                <LivingWarmHearth
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isRecording={isRecording}
                  isThinking={isProcessing}
                  size={320}
                  intensity={isSpeaking ? 0.85 : isRecording ? 0.9 : 0.45}
                />
              </div>

              {/* Dyskretny status obecności */}
              <div className="flex items-center justify-center gap-2 mb-3 font-sans">
                {isSpeaking ? (
                  <div className="text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 px-5 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>{profile.companionName} odpowiada...</span>
                  </div>
                ) : isProcessing ? (
                  <div className="text-xs font-medium text-amber-200 bg-amber-950/60 border border-amber-500/30 px-5 py-2 rounded-full animate-pulse shadow-lg">
                    Zastanawiam się...
                  </div>
                ) : isRecording ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-200 bg-amber-950/80 border border-amber-500/40 px-5 py-2 rounded-full shadow-lg">
                    <Radio size={14} className="animate-spin text-amber-400" />
                    <span>Słucham Cię uważnie...</span>
                  </div>
                ) : isListening ? (
                  <div className="text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Rozmowa na żywo • Mów swobodnie</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-stone-400 bg-white/5 px-5 py-2 rounded-full">
                    Połączenie aktywne
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="text-xs text-amber-200 bg-amber-950/80 border border-amber-500/40 px-4 py-1.5 rounded-full mb-3 shadow-lg">
                  {errorMessage}
                </div>
              )}

              {/* Rozwijana szuflada historii i pisania na dole */}
              <div className="mt-5">
                <button
                  onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                  className="flex items-center gap-2 text-xs text-stone-300 hover:text-white px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-amber-500/20 transition-colors shadow-lg backdrop-blur-md"
                >
                  <MessageSquare size={13} strokeWidth={1.75} className="text-amber-400" />
                  <span>Historia rozmowy i napisy</span>
                  {showTranscriptDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showTranscriptDrawer && (
                <div className="mt-3 w-full max-h-60 overflow-y-auto bg-[#181410]/95 border border-amber-500/25 rounded-2xl p-4 text-left text-xs font-sans text-stone-200 space-y-3 shadow-2xl backdrop-blur-xl animate-fade-in">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold border-b border-white/10 pb-1.5 flex justify-between items-center">
                    <span>Rozmowa z {profile.companionName}</span>
                  </div>
                  <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                    {sessionMessages.length === 0 ? (
                      <p className="text-stone-500 italic">Brak zapisanych wypowiedzi w tej sesji.</p>
                    ) : (
                      sessionMessages.map((m, idx) => (
                        <div key={idx} className={m.sender === "user" ? "text-right" : "text-left"}>
                          <span className="font-semibold text-amber-300/80">
                            {m.sender === "user" ? profile.name : profile.companionName}:
                          </span>{" "}
                          <span className="text-[#FBF8F1]">{m.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleDrawerSend} className="flex items-center gap-2 pt-2.5 border-t border-white/10">
                    <input
                      type="text"
                      value={drawerInputText}
                      onChange={(e) => setDrawerInputText(e.target.value)}
                      placeholder="Napisz wiadomość..."
                      className="flex-1 bg-white/5 px-3.5 py-2 rounded-full text-xs font-sans text-white placeholder:text-stone-500 border border-white/10 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!drawerInputText.trim()}
                      className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold disabled:opacity-30 transition-all shadow-md"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Dolny pasek połączenia */}
            <div className="w-full max-w-md flex items-center justify-center gap-4 pt-4 pb-2 z-10">
              <button
                onClick={handleEndCallClick}
                className="flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-500 text-white font-sans font-semibold px-8 py-3.5 rounded-full shadow-xl transition-all active:scale-95 text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(239,68,68,0.35)]"
                title="Zakończ rozmowę"
              >
                <PhoneOff size={16} strokeWidth={2.2} />
                <span>Zakończ rozmowę</span>
              </button>

              <button
                onClick={handleCloseModal}
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 px-6 py-3.5 rounded-full text-xs sm:text-sm font-sans font-medium active:scale-95 transition-all shadow-lg backdrop-blur-md"
                title="Wróć do aplikacji"
              >
                <span>Wróć</span>
              </button>
            </div>
          </>
        ) : (
          /* Ekran po zakończeniu rozmowy */
          <div className="my-auto max-w-lg w-full text-center flex flex-col items-center animate-fade-in py-8 z-10">
            <div className="mb-4">
              <LivingWarmHearth size={180} intensity={0.4} />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-[#FFFBEB] font-normal tracking-tight mb-3">
              Dobrze było Cię usłyszeć.
            </h2>

            <p className="font-sans text-xs sm:text-sm text-stone-300 leading-relaxed max-w-md mb-8">
              Pamiętam to, o czym rozmawialiśmy. Jeśli chcesz, następnym razem wrócimy do tych spraw.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={handleCloseModal}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-stone-950 font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm font-sans px-7 py-3.5 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all"
              >
                <Home size={15} strokeWidth={2} />
                <span>Wróć do strony głównej</span>
              </button>

              <Link
                href="/memory"
                onClick={handleCloseModal}
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 flex items-center justify-center gap-2 text-xs sm:text-sm font-sans px-6 py-3.5 rounded-full font-medium active:scale-95 transition-all shadow-lg backdrop-blur-md"
              >
                <Compass size={15} strokeWidth={1.75} className="text-amber-400" />
                <span>Zobacz, co pamiętam</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
