"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PhoneOff, MessageSquare, ArrowLeft, X, ChevronDown, ChevronUp, Compass, Home, Send, Radio, Sparkles } from "lucide-react";
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
        setErrorMessage("Dotknij, aby zezwolić na mikrofon w przeglądarce.");
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
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0F0D0A]/95 text-[#FBF8F1] px-4 sm:px-8 py-6 select-none overflow-hidden"
      >
        {/* Luksusowe tło aksamitne z subtelną winietą i ciepłą poświatą */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 38%, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 50%, rgba(15, 13, 10, 0.95) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Górny pasek nawigacji */}
        <div className="w-full max-w-2xl flex items-center justify-between z-10">
          <button
            onClick={handleCloseModal}
            className="flex items-center gap-2 text-xs font-sans font-medium text-[#FBF8F1] bg-white/5 hover:bg-white/10 border border-amber-500/30 hover:border-amber-500/60 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95"
            title="Wróć do aplikacji (lub naciśnij ESC)"
          >
            <ArrowLeft size={14} strokeWidth={2} className="text-amber-400" />
            <span>Wróć do aplikacji</span>
          </button>

          {!isCallEnded && (
            <div className="flex items-center gap-2.5 bg-white/5 border border-amber-500/25 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]" />
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
            {/* Centralna żywa obecność */}
            <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg w-full z-10">
              {/* Palenisko z możliwością kliknięcia do natychmiastowego nagrania */}
              <div
                className="relative mb-4 cursor-pointer group"
                onClick={handleToggleManualRecord}
                title={isRecording ? "Dotknij, aby zakończyć nagranie i wysłać" : "Dotknij paleniska, aby mówić"}
              >
                <LivingWarmHearth
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isRecording={isRecording}
                  isThinking={isProcessing}
                  size={300}
                  intensity={isSpeaking ? 0.9 : isRecording ? 1.0 : isListening ? 0.6 : isProcessing ? 0.65 : 0.4}
                />
              </div>

              {/* Status mikrofonu / mowy */}
              <div className="flex items-center justify-center gap-2 mb-3 font-sans">
                {isRecording ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-300 bg-red-950/80 border border-red-500/40 px-4 py-1.5 rounded-full animate-pulse shadow-lg">
                    <Radio size={14} className="animate-spin text-red-400" />
                    <span>Nagrywam Twój głos... Dotknij, by wysłać</span>
                  </div>
                ) : isSpeaking ? (
                  <div className="text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 px-4 py-1 rounded-full flex items-center gap-2 shadow-lg">
                    <Sparkles size={13} className="text-amber-400 animate-pulse" />
                    <span>{profile.companionName} mówi...</span>
                  </div>
                ) : isProcessing ? (
                  <div className="text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 px-4 py-1 rounded-full animate-pulse shadow-lg">
                    Zastanawiam się...
                  </div>
                ) : isListening ? (
                  <div className="text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-4 py-1 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Słucham Cię • Mów śmiało lub dotknij</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-stone-400 bg-white/5 px-3.5 py-1 rounded-full">
                    Dotknij mikrofonu poniżej, aby mówić
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="text-xs text-amber-200 bg-amber-950/80 border border-amber-500/40 px-4 py-1.5 rounded-full mb-3 shadow-lg">
                  {errorMessage}
                </div>
              )}

              {/* Tekst wypowiedzi */}
              <div className="min-h-[85px] flex flex-col items-center justify-center px-4 w-full">
                {liveTranscript && (
                  <p className="font-sans text-xs text-amber-200/80 mb-1.5">
                    <span className="font-semibold text-amber-400">{profile.name}:</span> „{liveTranscript}”
                  </p>
                )}
                <p className="font-serif text-xl sm:text-2xl text-[#FFFBEB] leading-relaxed max-w-md italic tracking-wide">
                  {isSpeaking
                    ? `„${companionText}”`
                    : !liveTranscript
                    ? "Mów swobodnie lub dotknij mikrofonu. Jestem obok."
                    : `„${companionText || "Słucham..."}”`}
                </p>
              </div>

              {/* Rozwijana szuflada historii i pisania */}
              <div className="mt-4">
                <button
                  onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                  className="flex items-center gap-2 text-xs text-stone-300 hover:text-white px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-amber-500/20 transition-colors shadow-lg backdrop-blur-md"
                >
                  <MessageSquare size={13} strokeWidth={1.75} className="text-amber-400" />
                  <span>Historia rozmowy / Pisz</span>
                  {showTranscriptDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showTranscriptDrawer && (
                <div className="mt-3 w-full max-h-60 overflow-y-auto bg-[#181410]/95 border border-amber-500/25 rounded-2xl p-4 text-left text-xs font-sans text-stone-200 space-y-3 shadow-2xl backdrop-blur-xl animate-fade-in">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold border-b border-white/10 pb-1.5">
                    Rozmowa na żywo z {profile.companionName}
                  </div>
                  <div className="space-y-2.5 max-h-32 overflow-y-auto pr-1">
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

                  {/* Bezpośrednie pole wpisywania w szufladzie */}
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

            {/* Dolne zunifikowane kontrolki rozmowy */}
            <div className="w-full max-w-md flex items-center justify-center gap-3 pt-4 pb-2 z-10">
              {/* Przycisk nagrywania głosu / mikrofonu */}
              <button
                onClick={handleToggleManualRecord}
                className={`flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full transition-all shadow-xl font-sans text-xs sm:text-sm font-semibold select-none active:scale-95 ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-stone-950 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                }`}
                title={isRecording ? "Zakończ nagranie i wyślij" : "Dotknij, aby mówić"}
              >
                {isRecording ? (
                  <>
                    <Radio size={17} className="animate-spin" />
                    <span>Wyślij nagranie</span>
                  </>
                ) : (
                  <>
                    <Mic size={17} strokeWidth={2.2} />
                    <span>Dotknij i mów</span>
                  </>
                )}
              </button>

              {/* Zakończ rozmowę */}
              <button
                onClick={handleEndCallClick}
                className="flex items-center justify-center gap-2 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-sans font-medium px-5 py-3.5 rounded-full shadow-lg transition-all active:scale-95 text-xs sm:text-sm tracking-wide"
                title="Zakończ tę rozmowę"
              >
                <PhoneOff size={15} strokeWidth={2} />
                <span>Zakończ</span>
              </button>

              {/* Wróć do aplikacji */}
              <button
                onClick={handleCloseModal}
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 px-5 py-3.5 rounded-full text-xs sm:text-sm font-sans font-medium active:scale-95 transition-all shadow-lg backdrop-blur-md"
                title="Wróć do aplikacji"
              >
                <span>Wróć</span>
              </button>
            </div>
          </>
        ) : (
          /* Ekran relacyjny po zakończeniu rozmowy */
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
