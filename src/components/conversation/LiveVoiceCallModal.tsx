"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, MessageSquare, ArrowLeft, X, ChevronDown, ChevronUp, Compass, Home, Send, Radio, Sparkles } from "lucide-react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { voiceEngine, VoiceEngineState } from "@/lib/voice-engine";
import { getCompanionReplyAsync } from "@/lib/companion-personality";
import { getStoredProfile } from "@/lib/storage";
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
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [companionText, setCompanionText] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [drawerInputText, setDrawerInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const durationTimerRef = useRef<any>(null);
  const companionVoice = profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova");

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Obsługa klawisza Escape
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
    setLiveTranscript(cleanUserText);
    setIsProcessing(true);
    setErrorMessage(null);

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

      // Odtwórz głos lektora
      await voiceEngine.speak(reply.text, undefined, companionVoice);
    } catch (e) {
      console.error("Conversation processing error:", e);
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
    setErrorMessage(null);

    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    const greetingText = `Cześć, ${profile.name}. Jestem ${profile.companionName}. Usiądź wygodnie — słucham Cię.`;
    setCompanionText(greetingText);

    // Odtwórz przywitanie
    voiceEngine.speak(greetingText, undefined, companionVoice);

    voiceEngine.setCallbacks(
      (capturedText) => {
        processUserMessage(capturedText);
      },
      (state: VoiceEngineState) => {
        setIsListening(state.isListening);
        setIsRecording(state.isRecording);
        setIsSpeaking(state.isSpeaking);
        setIsProcessing(state.isProcessing);
        if (state.transcript) {
          setLiveTranscript(state.transcript);
        }
        if (state.errorMessage) {
          setErrorMessage(state.errorMessage);
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

  // Obsługa przycisku Dotknij i mów / Wyślij
  const handleToggleManualRecord = async () => {
    setErrorMessage(null);
    if (isRecording) {
      const text = await voiceEngine.stopManualRecordingAndTranscribe();
      if (text) {
        processUserMessage(text);
      }
    } else {
      const started = await voiceEngine.startManualRecording();
      if (!started) {
        setErrorMessage("Dotknij, aby zezwolić na mikrofon w Safari.");
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
            className="flex items-center gap-2 text-xs font-sans font-medium text-ink bg-paper-surface hover:bg-paper-dark border border-warm-amber/30 hover:border-warm-amber/70 px-4 py-2 rounded-full shadow-quiet-sm transition-all active:scale-95"
            title="Wróć do aplikacji (lub naciśnij ESC)"
          >
            <ArrowLeft size={14} strokeWidth={2} className="text-warm-amber" />
            <span>Wróć do aplikacji</span>
          </button>

          {!isCallEnded && (
            <div className="flex items-center gap-2 bg-paper-surface border border-warm-amber/25 px-4 py-1.5 rounded-full shadow-quiet-sm">
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
              {/* Palenisko z możliwością kliknięcia do natychmiastowego nagrania */}
              <div
                className="relative mb-3 cursor-pointer group"
                onClick={handleToggleManualRecord}
                title={isRecording ? "Dotknij, aby zakończyć nagranie i wysłać" : "Dotknij paleniska, aby mówić"}
              >
                <LivingWarmHearth
                  isListening={isListening || isRecording}
                  isSpeaking={isSpeaking}
                  size={280}
                  intensity={isSpeaking ? 0.85 : isRecording ? 0.95 : isListening ? 0.55 : isProcessing ? 0.6 : 0.3}
                />
              </div>

              {/* Status mikrofonu / mowy */}
              <div className="flex items-center justify-center gap-2 mb-3 font-sans">
                {isRecording ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100/90 border border-red-300 px-4 py-1.5 rounded-full animate-pulse shadow-quiet-sm">
                    <Radio size={14} className="animate-spin" />
                    <span>Nagrywam Twój głos... Dotknij, by wysłać</span>
                  </div>
                ) : isSpeaking ? (
                  <div className="text-xs font-medium text-warm-amber bg-warm-gold/10 border border-warm-amber/20 px-3.5 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>{profile.companionName} mówi...</span>
                  </div>
                ) : isProcessing ? (
                  <div className="text-xs font-medium text-warm-amber bg-warm-gold/10 border border-warm-amber/20 px-3.5 py-1 rounded-full animate-pulse">
                    Zastanawiam się...
                  </div>
                ) : isListening ? (
                  <div className="text-xs font-medium text-emerald-800 bg-emerald-100/80 border border-emerald-300/80 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-quiet-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>Słucham Cię • Mów śmiało lub dotknij</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-ink-muted bg-paper-dark px-3 py-1 rounded-full">
                    Dotknij mikrofonu poniżej, aby mówić
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="text-xs text-amber-900 bg-amber-100 border border-amber-300 px-4 py-1.5 rounded-full mb-3 shadow-quiet-sm">
                  {errorMessage}
                </div>
              )}

              {/* Tekst wypowiedzi */}
              <div className="min-h-[75px] flex flex-col items-center justify-center px-4 w-full">
                {liveTranscript && (
                  <p className="font-sans text-xs text-ink-muted mb-1">
                    <span className="font-semibold">{profile.name}:</span> „{liveTranscript}”
                  </p>
                )}
                <p className="font-serif text-lg md:text-xl text-ink leading-relaxed max-w-md italic">
                  {isSpeaking
                    ? `„${companionText}”`
                    : !liveTranscript
                    ? "Mów swobodnie lub naciśnij mikrofon. Jestem obok."
                    : `„${companionText || "Słucham..."}”`}
                </p>
              </div>

              {/* Rozwijana szuflada historii i pisania */}
              <div className="mt-4">
                <button
                  onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                  className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink px-4 py-1.5 rounded-full bg-paper-surface border border-warm-amber/25 transition-colors shadow-quiet-sm"
                >
                  <MessageSquare size={13} strokeWidth={1.75} />
                  <span>Historia rozmowy / Pisz</span>
                  {showTranscriptDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showTranscriptDrawer && (
                <div className="mt-3 w-full max-h-56 overflow-y-auto bg-paper-surface border border-warm-amber/25 rounded-card p-4 text-left text-xs font-sans text-ink space-y-3 shadow-quiet-md animate-fade-in">
                  <div className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold border-b border-ink/8 pb-1">
                    Rozmowa na żywo z {profile.companionName}
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
                      placeholder="Napisz wiadomość..."
                      className="flex-1 bg-paper px-3.5 py-2 rounded-full text-xs font-sans text-ink placeholder:text-ink-subtle border border-ink/10 focus:outline-none focus:border-warm-amber"
                    />
                    <button
                      type="submit"
                      disabled={!drawerInputText.trim()}
                      className="p-2 rounded-full bg-warm-gold/20 hover:bg-warm-amber/30 text-warm-amber disabled:opacity-30 transition-all"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Dolne zunifikowane kontrolki rozmowy */}
            <div className="w-full max-w-md flex items-center justify-center gap-3 pt-4 pb-2">
              {/* Przycisk nagrywania głosu / mikrofonu */}
              <button
                onClick={handleToggleManualRecord}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full transition-all shadow-quiet-md font-sans text-xs sm:text-sm font-medium select-none active:scale-95 ${
                  isRecording
                    ? "bg-red-700 hover:bg-red-800 text-white animate-pulse"
                    : "presence-btn-primary text-ink"
                }`}
                title={isRecording ? "Zakończ nagranie i wyślij" : "Dotknij, aby mówić"}
              >
                {isRecording ? (
                  <>
                    <Radio size={16} className="animate-spin" />
                    <span>Wyślij nagranie</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} strokeWidth={2} />
                    <span>Dotknij i mów</span>
                  </>
                )}
              </button>

              {/* Zakończ rozmowę */}
              <button
                onClick={handleEndCallClick}
                className="flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white font-sans font-medium px-5 py-3.5 rounded-full shadow-quiet-md transition-all active:scale-95 text-xs sm:text-sm tracking-wide"
                title="Zakończ tę rozmowę"
              >
                <PhoneOff size={15} strokeWidth={2} />
                <span>Zakończ</span>
              </button>

              {/* Wróć do aplikacji */}
              <button
                onClick={handleCloseModal}
                className="presence-btn-secondary px-5 py-3.5 rounded-full text-xs sm:text-sm font-sans font-medium active:scale-95"
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
                className="presence-btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-sans px-7 py-3.5 rounded-full shadow-quiet-md"
              >
                <Home size={15} strokeWidth={1.75} />
                <span>Wróć do strony głównej</span>
              </button>

              <Link
                href="/memory"
                onClick={handleCloseModal}
                className="presence-btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm font-sans px-6 py-3.5 rounded-full font-medium"
              >
                <Compass size={15} strokeWidth={1.75} />
                <span>Zobacz, co pamiętam</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
