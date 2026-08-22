"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, MessageSquare, ArrowLeft, X, ChevronDown, ChevronUp, Compass, Home, Send, Radio } from "lucide-react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { voiceEngine } from "@/lib/voice-engine";
import { getCompanionReplyAsync } from "@/lib/companion-personality";
import { getStoredProfile, saveStoredProfile } from "@/lib/storage";
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
  const [isListening, setIsListening] = useState(true);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [companionText, setCompanionText] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [drawerInputText, setDrawerInputText] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const durationTimerRef = useRef<any>(null);
  const companionVoice = profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova");

  // Synchronizacja profilu z nadrzędnym komponentem
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Obsługa klawisza Escape do natychmiastowego wyjścia
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
    onClose();
  };

  const processUserMessage = async (userText: string) => {
    if (!userText || userText.trim().length === 0) return;

    const cleanUserText = userText.trim();
    const userMsg: Message = {
      id: "msg_" + Date.now(),
      userId: profile.id,
      sender: "user",
      text: cleanUserText,
      messageType: "voice",
      createdAt: new Date().toISOString(),
    };

    onNewMessage(userMsg);
    setSessionMessages((prev) => [...prev, userMsg]);
    setLiveTranscript(cleanUserText);
    setIsProcessing(true);
    setMicError(null);

    try {
      const currentFreshProfile = getStoredProfile() || profile;
      const reply = await getCompanionReplyAsync(cleanUserText, currentFreshProfile);
      setCompanionText(reply.text);

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

      onNewMessage(companionMsg);
      setSessionMessages((prev) => [...prev, companionMsg]);

      voiceEngine.speak(reply.text, undefined, companionVoice);
    } catch (e) {
      console.error("Conversation error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      voiceEngine.stopLiveDialogue();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setIsCallEnded(false);
      setSessionMessages([]);
      return;
    }

    voiceEngine.unlock();
    setCallDuration(0);
    setIsCallEnded(false);
    setShowTranscriptDrawer(false);
    setMicError(null);

    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    const greetingText = `Cześć, ${profile.name}. Jestem ${profile.companionName}. Usiądź wygodnie — słucham Cię.`;
    setCompanionText(greetingText);

    // Odtwarzamy przywitanie natychmiast
    voiceEngine.speak(greetingText, undefined, companionVoice);

    voiceEngine.setCallbacks(
      (capturedText) => {
        processUserMessage(capturedText);
      },
      (state) => {
        setIsListening(state.isListening);
        setIsSpeaking(state.isSpeaking);
        setIsRecordingAudio(Boolean(state.isRecordingAudio));
        if (state.transcript) {
          setLiveTranscript(state.transcript);
        }
        if (state.errorMessage) {
          setMicError(state.errorMessage);
        }
      }
    );

    voiceEngine.startLiveDialogue();

    return () => {
      voiceEngine.stopLiveDialogue();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [isOpen]);

  const handleEndCallClick = () => {
    voiceEngine.stopLiveDialogue();
    voiceEngine.stopSpeaking();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setIsCallEnded(true);
  };

  // Obsługa przycisku Tap-to-Speak / Push-to-Talk dla 100% niezawodności na iOS
  const handleToggleRecord = async () => {
    setMicError(null);
    if (isRecordingAudio) {
      // Zakończ nagranie i przetwórz przez Whisper
      const text = await voiceEngine.stopRecordingAndTranscribe();
      if (text) {
        processUserMessage(text);
      }
    } else {
      // Rozpocznij nagrywanie
      const started = await voiceEngine.startRecording();
      if (!started) {
        setMicError("Dotknij, aby zezwolić na mikrofon w przeglądarce.");
      }
    }
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
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-paper/98 backdrop-blur-2xl px-4 sm:px-8 py-6 select-none text-ink"
      >
        {/* Górny pasek nawigacji — ZAWSZE WIDOCZNY z czytelnym powrotem */}
        <div className="w-full max-w-2xl flex items-center justify-between z-10">
          <button
            onClick={handleCloseModal}
            className="flex items-center gap-2 text-xs font-sans font-medium text-ink bg-paper-surface hover:bg-paper-dark border border-warm-amber/25 hover:border-warm-amber/60 px-4 py-2 rounded-full shadow-quiet-sm transition-all active:scale-95"
            title="Wróć do aplikacji (lub naciśnij ESC)"
          >
            <ArrowLeft size={14} strokeWidth={2} className="text-warm-amber" />
            <span>Wróć do aplikacji</span>
          </button>

          {!isCallEnded && (
            <div className="flex items-center gap-2 bg-paper-surface border border-warm-amber/20 px-3.5 py-1.5 rounded-full shadow-quiet-sm">
              <div className="w-2 h-2 rounded-full bg-warm-amber animate-pulse" />
              <span className="text-xs text-ink font-sans font-medium">
                {profile.companionName} • {formatDuration(callDuration)}
              </span>
            </div>
          )}

          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full bg-paper-surface hover:bg-paper-dark border border-ink/8 text-ink-muted hover:text-ink transition-colors shadow-quiet-sm"
            title="Zamknij (ESC)"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Widok w trakcie rozmowy */}
        {!isCallEnded ? (
          <>
            {/* Centralna żywa obecność */}
            <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg w-full">
              <div className="relative mb-3 cursor-pointer group" onClick={handleToggleRecord}>
                <LivingWarmHearth
                  isListening={isListening || isRecordingAudio}
                  isSpeaking={isSpeaking}
                  size={280}
                  intensity={isSpeaking ? 0.85 : isRecordingAudio ? 0.95 : isListening ? 0.55 : isProcessing ? 0.6 : 0.3}
                />
              </div>

              {/* Status mikrofonu / mowy */}
              <div className="flex items-center justify-center gap-2 mb-2 font-sans">
                {isRecordingAudio ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100/90 border border-red-300 px-3.5 py-1 rounded-full animate-pulse">
                    <Radio size={13} className="animate-spin" />
                    <span>Nagrywam... Dotknij mikrofon, by wysłać</span>
                  </div>
                ) : isSpeaking ? (
                  <div className="text-xs font-medium text-warm-amber">
                    {profile.companionName} mówi...
                  </div>
                ) : isProcessing ? (
                  <div className="text-xs font-medium text-warm-amber animate-pulse">
                    Zastanawiam się...
                  </div>
                ) : isListening ? (
                  <div className="text-xs font-medium text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    <span>Mikrofon aktywny • Mów swobodnie</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-ink-muted">
                    Dotknij mikrofonu, aby mówić
                  </div>
                )}
              </div>

              {micError && (
                <div className="text-[11px] text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full mb-2">
                  {micError}
                </div>
              )}

              {/* Tekst wypowiedzi */}
              <div className="min-h-[65px] flex items-center justify-center px-4">
                <p className="font-serif text-lg md:text-xl text-ink leading-relaxed max-w-md italic">
                  {isSpeaking
                    ? `„${companionText}”`
                    : liveTranscript
                    ? `„${liveTranscript}”`
                    : "Mów swobodnie lub naciśnij mikrofon. Jestem obok."}
                </p>
              </div>

              {/* Opcjonalny rozwijany podgląd transkrypcji i pisania */}
              <div className="mt-3">
                <button
                  onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                  className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink px-3.5 py-1.5 rounded-full bg-paper-surface border border-warm-amber/20 transition-colors shadow-quiet-sm"
                >
                  <MessageSquare size={13} strokeWidth={1.75} />
                  <span>Czat / Napisz wiadomość</span>
                  {showTranscriptDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showTranscriptDrawer && (
                <div className="mt-3 w-full max-h-56 overflow-y-auto bg-paper-surface border border-warm-amber/20 rounded-card p-4 text-left text-xs font-sans text-ink space-y-3 shadow-quiet-md animate-fade-in">
                  <div className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold border-b border-ink/8 pb-1">
                    Historia rozmowy z {profile.companionName}
                  </div>
                  <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                    {sessionMessages.length === 0 ? (
                      <p className="text-ink-subtle italic">Brak zapisanych wypowiedzi w tej sesji.</p>
                    ) : (
                      sessionMessages.map((m, idx) => (
                        <div key={idx} className={m.sender === "user" ? "text-right" : "text-left"}>
                          <span className="font-semibold text-ink-muted">
                            {m.sender === "user" ? profile.name : profile.companionName}:
                          </span>{" "}
                          <span className="text-ink">{m.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bezpośrednie pole wpisywania w szufladzie */}
                  <form onSubmit={handleDrawerSend} className="flex items-center gap-2 pt-2 border-t border-ink/8">
                    <input
                      type="text"
                      value={drawerInputText}
                      onChange={(e) => setDrawerInputText(e.target.value)}
                      placeholder="Napisz do Przyjaciela..."
                      className="flex-1 bg-paper px-3 py-1.5 rounded-full text-xs font-sans text-ink placeholder:text-ink-subtle border border-ink/10 focus:outline-none focus:border-warm-amber"
                    />
                    <button
                      type="submit"
                      disabled={!drawerInputText.trim()}
                      className="p-2 rounded-full bg-paper-dark hover:bg-warm-amber/10 text-warm-amber disabled:opacity-30"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Dolne kontrolki rozmowy */}
            <div className="w-full max-w-md flex items-center justify-center gap-4 pt-4 pb-2">
              {/* Przycisk nagrywania głosu / mikrofonu */}
              <button
                onClick={handleToggleRecord}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-full transition-all shadow-quiet-md font-sans text-xs font-medium ${
                  isRecordingAudio
                    ? "bg-red-700 hover:bg-red-800 text-white animate-pulse"
                    : isListening
                    ? "bg-paper-surface hover:bg-paper-dark text-ink border border-warm-amber/30 ring-1 ring-warm-amber/20"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
                title={isRecordingAudio ? "Zakończ nagranie i wyślij" : "Dotknij, aby mówić"}
              >
                {isRecordingAudio ? (
                  <>
                    <Mic size={17} className="animate-pulse" />
                    <span>Wyślij nagranie</span>
                  </>
                ) : (
                  <>
                    <Mic size={17} />
                    <span>{isListening ? "Mówię / Dotknij" : "Włącz mikrofon"}</span>
                  </>
                )}
              </button>

              {/* Zakończ rozmowę */}
              <button
                onClick={handleEndCallClick}
                className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white font-sans font-medium px-6 py-3.5 rounded-full shadow-quiet-md transition-all active:scale-95 text-xs tracking-wide"
              >
                <PhoneOff size={15} strokeWidth={2} />
                <span>Zakończ</span>
              </button>

              {/* Wróć do aplikacji */}
              <button
                onClick={handleCloseModal}
                className="presence-btn-secondary px-4 py-3.5 rounded-full text-xs font-sans font-medium"
                title="Wróć do aplikacji"
              >
                <span>Wróć</span>
              </button>
            </div>
          </>
        ) : (
          /* Ekran relacyjny po zakończeniu rozmowy */
          <div className="my-auto max-w-lg w-full text-center flex flex-col items-center animate-fade-in py-8">
            <div className="mb-4">
              <LivingWarmHearth size={160} intensity={0.35} />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight mb-3">
              Dobrze było Cię usłyszeć.
            </h2>

            <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md mb-8">
              Pamiętam to, o czym rozmawialiśmy. Jeśli chcesz, następnym razem wrócimy do tych spraw.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={handleCloseModal}
                className="presence-btn-primary flex items-center justify-center gap-2 text-xs font-sans px-7 py-3.5 rounded-full shadow-quiet-md"
              >
                <Home size={14} strokeWidth={1.75} />
                <span>Wróć do strony głównej</span>
              </button>

              <Link
                href="/memory"
                onClick={handleCloseModal}
                className="presence-btn-secondary flex items-center justify-center gap-2 text-xs font-sans px-6 py-3.5 rounded-full"
              >
                <Compass size={14} strokeWidth={1.75} />
                <span>Zobacz, co pamiętam</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
