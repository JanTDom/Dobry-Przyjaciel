"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, MessageSquare, Check, X, ChevronDown, ChevronUp, Compass } from "lucide-react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { voiceEngine } from "@/lib/voice-engine";
import { getCompanionReplyAsync } from "@/lib/companion-personality";
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
  profile,
  onNewMessage,
}) => {
  const [isListening, setIsListening] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [companionText, setCompanionText] = useState(
    `Cześć, ${profile.name}. Jestem ${profile.companionName}. Usiądź wygodnie — słucham Cię.`
  );
  const [callDuration, setCallDuration] = useState(0);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);

  const durationTimerRef = useRef<any>(null);
  const companionVoice = profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova");

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

    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    const greetingText = `Cześć, ${profile.name}. Jestem ${profile.companionName}. Usiądź wygodnie — słucham Cię.`;
    setCompanionText(greetingText);

    // Odtwarzamy przywitanie natychmiast
    voiceEngine.speak(greetingText, undefined, companionVoice);

    voiceEngine.setCallbacks(
      async (capturedUserText: string) => {
        if (!capturedUserText || capturedUserText.trim().length === 0) return;

        const userMsg: Message = {
          id: "msg_" + Date.now(),
          userId: profile.id,
          sender: "user",
          text: capturedUserText,
          messageType: "voice",
          createdAt: new Date().toISOString(),
        };
        onNewMessage(userMsg);
        setSessionMessages((prev) => [...prev, userMsg]);
        setLiveTranscript(capturedUserText);
        setIsProcessing(true);

        try {
          const reply = await getCompanionReplyAsync(capturedUserText, profile);
          setCompanionText(reply.text);

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
      },
      (state) => {
        setIsListening(state.isListening);
        setIsSpeaking(state.isSpeaking);
        if (state.transcript) {
          setLiveTranscript(state.transcript);
        }
      }
    );

    voiceEngine.startLiveDialogue();

    return () => {
      voiceEngine.stopLiveDialogue();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [isOpen, profile]);

  const handleEndCallClick = () => {
    voiceEngine.stopLiveDialogue();
    voiceEngine.stopSpeaking();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setIsCallEnded(true);
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
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-paper/98 backdrop-blur-2xl px-6 py-8 select-none text-ink"
      >
        {/* Widok w trakcie rozmowy */}
        {!isCallEnded ? (
          <>
            {/* Górny dyskretny status */}
            <div className="w-full max-w-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 bg-paper-surface border border-ink/8 px-4 py-1.5 rounded-full shadow-quiet-sm">
                <div className="w-2 h-2 rounded-full bg-warm-amber animate-pulse" />
                <span className="text-xs text-ink-muted font-sans font-medium">
                  {profile.companionName} • {formatDuration(callDuration)}
                </span>
              </div>

              <button
                onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink px-3 py-1.5 rounded-full bg-paper-surface border border-ink/8 transition-colors"
              >
                <MessageSquare size={13} strokeWidth={1.75} />
                <span>Napisz / Tekst</span>
                {showTranscriptDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Centralna żywa obecność */}
            <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg w-full">
              <div className="relative mb-6">
                <LivingWarmHearth
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  size={290}
                  intensity={isSpeaking ? 0.65 : isListening ? 0.35 : isProcessing ? 0.5 : 0.2}
                />
              </div>

              <div className="text-xs font-medium tracking-wide text-ink-muted mb-3">
                {isSpeaking
                  ? `${profile.companionName} mówi`
                  : isProcessing
                  ? "Zastanawiam się..."
                  : isListening
                  ? "Słucham Cię uważnie..."
                  : "Jestem przy Tobie"}
              </div>

              <div className="min-h-[70px] flex items-center justify-center px-4">
                <p className="font-serif text-lg md:text-xl text-ink leading-relaxed max-w-md italic">
                  {isSpeaking
                    ? `„${companionText}”`
                    : liveTranscript
                    ? `„${liveTranscript}”`
                    : "Mów swobodnie. Jestem obok."}
                </p>
              </div>

              {/* Opcjonalny rozwijany podgląd transkrypcji */}
              {showTranscriptDrawer && (
                <div className="mt-4 w-full max-h-48 overflow-y-auto bg-paper-surface border border-ink/8 rounded-card p-4 text-left text-xs font-sans text-ink space-y-2 shadow-quiet-md animate-fade-in">
                  <div className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold border-b border-ink/8 pb-1">
                    Historia rozmowy
                  </div>
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
              )}
            </div>

            {/* Dolne kontrolki rozmowy */}
            <div className="w-full max-w-md flex items-center justify-center gap-5 pt-4">
              <button
                onClick={() => {
                  if (isListening) {
                    voiceEngine.stopLiveDialogue();
                    setIsListening(false);
                  } else {
                    voiceEngine.startLiveDialogue();
                    setIsListening(true);
                  }
                }}
                className={`p-4 rounded-full transition-all shadow-quiet-sm ${
                  isListening
                    ? "bg-white text-ink border border-ink/10 hover:bg-paper-dark"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
                title={isListening ? "Wstrzymaj mikrofon" : "Włącz mikrofon"}
              >
                {isListening ? <Mic size={20} strokeWidth={1.75} /> : <MicOff size={20} strokeWidth={1.75} />}
              </button>

              <button
                onClick={handleEndCallClick}
                className="flex items-center gap-2.5 bg-ink hover:bg-black text-paper font-sans font-medium px-8 py-3.5 rounded-full shadow-quiet-md transition-all active:scale-95 text-xs tracking-wide"
              >
                <PhoneOff size={16} strokeWidth={1.75} />
                <span>Zakończ rozmowę</span>
              </button>
            </div>
          </>
        ) : (
          /* Ekran relacyjny po zakończeniu rozmowy */
          <div className="my-auto max-w-lg w-full text-center flex flex-col items-center animate-fade-in">
            <div className="mb-4">
              <LivingWarmHearth size={160} intensity={0.25} />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight mb-3">
              Dobrze było Cię usłyszeć.
            </h2>

            <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md mb-8">
              Pamiętam to, o czym rozmawialiśmy. Jeśli chcesz, następnym razem wrócimy do tych spraw.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={onClose}
                className="presence-btn-primary flex items-center justify-center gap-2 text-xs font-sans px-7 py-3.5 rounded-full"
              >
                <Check size={14} strokeWidth={2} />
                <span>Zapamiętaj i wróć do przystani</span>
              </button>

              <Link
                href="/memory"
                onClick={onClose}
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
