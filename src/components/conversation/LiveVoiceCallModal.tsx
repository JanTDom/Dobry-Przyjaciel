"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneOff,
  MessageSquare,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  Compass,
  Home,
  Send,
  Radio,
  Sparkles,
} from "lucide-react";
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
  /** Callback wywoływany gdy modal jest gotowy do odbioru tekstu mówionego */
  onReady?: () => void;
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
  const [userVolume, setUserVolume] = useState(0);
  const [statusLabel, setStatusLabel] = useState<string>("Łączę...");

  const durationTimerRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const sessionMessagesRef = useRef<Message[]>([]);
  const profileRef = useRef<UserProfile>(initialProfile);
  const companionVoiceRef = useRef<string>(
    initialProfile.companionVoice || (initialProfile.companionGender === "male" ? "echo" : "nova")
  );
  const hasGreetedRef = useRef(false);
  // Pilnuje że startMicAfterGreeting nie odpali się po zamknięciu modala
  const isOpenRef = useRef(false);

  useEffect(() => {
    sessionMessagesRef.current = sessionMessages;
  }, [sessionMessages]);

  useEffect(() => {
    profileRef.current = profile;
    companionVoiceRef.current =
      profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova");
  }, [profile]);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleCloseModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleCloseModal = useCallback(() => {
    isOpenRef.current = false;
    voiceEngine.stopLiveDialogue();
    voiceEngine.stopSpeaking();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    isProcessingRef.current = false;
    hasGreetedRef.current = false;
    onClose();
  }, [onClose]);

  const processUserMessage = useCallback(async (userText: string) => {
    if (!userText || userText.trim().length < 2) return;
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    const cleanText = userText.trim();

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusLabel("Zastanawiam się...");

    const currentProfile = getStoredProfile() || profileRef.current;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      userId: currentProfile.id,
      sender: "user",
      text: cleanText,
      messageType: "voice",
      createdAt: new Date().toISOString(),
    };

    addStoredMessage(userMsg);
    onNewMessage(userMsg);
    setSessionMessages((prev) => {
      const updated = [...prev, userMsg];
      sessionMessagesRef.current = updated;
      return updated;
    });

    try {
      const reply = await getCompanionReplyAsync(
        cleanText,
        currentProfile,
        sessionMessagesRef.current.slice(-10)
      );

      if (reply.updatedProfile) {
        setProfile(reply.updatedProfile);
        profileRef.current = reply.updatedProfile;
      }

      const companionMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        userId: currentProfile.id,
        sender: "companion",
        text: reply.text,
        messageType: "voice",
        moodContext: reply.moodContext,
        createdAt: new Date().toISOString(),
      };

      addStoredMessage(companionMsg);
      onNewMessage(companionMsg);
      setSessionMessages((prev) => {
        const updated = [...prev, companionMsg];
        sessionMessagesRef.current = updated;
        return updated;
      });

      setIsProcessing(false);
      setStatusLabel("Odpowiadam...");

      await voiceEngine.speak(reply.text, undefined, companionVoiceRef.current);
    } catch (e) {
      console.error("Conversation error:", e);
      setErrorMessage("Coś poszło nie tak. Spróbuj jeszcze raz.");
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
      setStatusLabel("Słucham Cię");
    }
  }, [onNewMessage]);

  useEffect(() => {
    if (!isOpen) {
      isOpenRef.current = false; // Blokuje opóźnione startMicAfterGreeting
      voiceEngine.stopLiveDialogue();
      voiceEngine.stopSpeaking();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      isProcessingRef.current = false;
      hasGreetedRef.current = false;
      setIsCallEnded(false);
      return;
    }

    isOpenRef.current = true;

    // Reset stanu
    setCallDuration(0);
    setIsCallEnded(false);
    setShowTranscriptDrawer(false);
    setErrorMessage(null);
    setStatusLabel("Łączę...");
    isProcessingRef.current = false;
    hasGreetedRef.current = false;

    const stored = getStoredMessages();
    const initialHistory = stored.slice(-8);
    setSessionMessages(initialHistory);
    sessionMessagesRef.current = initialHistory;

    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Zarejestruj callbacki PRZED startLiveDialogue
    voiceEngine.setCallbacks(
      (capturedText) => {
        processUserMessage(capturedText);
      },
      (state: VoiceEngineState) => {
        setIsListening(state.isListening);
        setIsRecording(state.isRecording);
        setIsSpeaking(state.isSpeaking);
        if (!isProcessingRef.current) {
          setIsProcessing(state.isProcessing);
        }
        setUserVolume(state.userVolume || 0);
        if (state.errorMessage) {
          setErrorMessage(state.errorMessage);
        }
      }
    );

    const currentProfile = getStoredProfile() || initialProfile;
    const greetingText = `Cześć ${currentProfile.name}. Słucham Cię.`;
    const voice =
      currentProfile.companionVoice ||
      (currentProfile.companionGender === "male" ? "echo" : "nova");

    // Żądamy dostępu do mikrofonu równolegle z powitaniem —
    // dialog pojawia się natychmiast, a mic jest gotowy gdy powitanie się kończy
    voiceEngine.getOrCreateMediaStream().catch(() => {});

    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true;
      setStatusLabel("Odpowiadam...");

      const startMicAfterGreeting = () => {
        if (!isOpenRef.current) return; // Modal zamknięty — nie ruszaj mikrofonu
        setStatusLabel("Słucham Cię");
        voiceEngine.startLiveDialogue();
      };

      voiceEngine.speak(greetingText, startMicAfterGreeting, voice).then((success) => {
        if (!success && isOpenRef.current) {
          startMicAfterGreeting();
        }
      });
    } else {
      voiceEngine.startLiveDialogue();
    }

    return () => {
      voiceEngine.stopLiveDialogue();
      voiceEngine.stopSpeaking();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      isProcessingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleEndCallClick = () => {
    isOpenRef.current = false;
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

  const isActive = isRecording || userVolume > 0.04;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0F0D0A]/97 text-[#FBF8F1] px-4 sm:px-8 py-6 select-none overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 38%, rgba(245, 158, 11, 0.07) 0%, rgba(15, 13, 10, 0.97) 100%)",
          }}
        />

        {/* Górny pasek */}
        <div className="w-full max-w-2xl flex items-center justify-between z-10">
          <button
            onClick={handleCloseModal}
            className="flex items-center gap-2 text-xs font-sans font-medium text-[#FBF8F1] bg-white/5 hover:bg-white/10 border border-amber-500/25 hover:border-amber-500/50 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95"
          >
            <ArrowLeft size={14} strokeWidth={2} className="text-amber-400" />
            <span>Wróć</span>
          </button>

          {!isCallEnded && (
            <div className="flex items-center gap-2.5 bg-white/5 border border-amber-500/20 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
              <span className="text-xs text-[#FBF8F1] font-sans font-medium tracking-wide">
                {profile.companionName} • {formatDuration(callDuration)}
              </span>
            </div>
          )}

          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors shadow-lg backdrop-blur-md"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Główna treść */}
        {!isCallEnded ? (
          <>
            <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg w-full z-10">
              <div className="relative mb-6">
                <LivingWarmHearth
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isRecording={isActive}
                  isThinking={isProcessing}
                  size={300}
                  intensity={isSpeaking ? 0.88 : isActive ? 0.98 : 0.42}
                />
              </div>

              <div className="flex flex-col items-center justify-center gap-2 mb-3 font-sans min-h-[36px]">
                {isSpeaking ? (
                  <div className="text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 px-5 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>{profile.companionName} mówi...</span>
                  </div>
                ) : isProcessing ? (
                  <div className="text-xs font-medium text-amber-200 bg-amber-950/60 border border-amber-500/30 px-5 py-2 rounded-full animate-pulse shadow-lg">
                    {statusLabel}
                  </div>
                ) : isActive ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-5 py-2 rounded-full shadow-lg animate-pulse">
                    <Radio size={14} className="text-emerald-400" />
                    <span>Słucham Cię...</span>
                  </div>
                ) : isListening ? (
                  <div className="text-xs font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-500/25 px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Słucham Cię</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-stone-500 bg-white/4 px-5 py-2 rounded-full">
                    {statusLabel}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="text-xs text-amber-200 bg-amber-950/80 border border-amber-500/40 px-4 py-1.5 rounded-full mb-3 shadow-lg">
                  {errorMessage}
                </div>
              )}

            </div>

            <div className="w-full max-w-md flex items-center justify-center gap-4 pt-4 pb-2 z-10">
              <button
                onClick={handleEndCallClick}
                className="flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-500 text-white font-sans font-semibold px-8 py-3.5 rounded-full shadow-xl transition-all active:scale-95 text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(239,68,68,0.35)]"
              >
                <PhoneOff size={16} strokeWidth={2.2} />
                <span>Zakończ rozmowę</span>
              </button>

              <button
                onClick={handleCloseModal}
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 px-6 py-3.5 rounded-full text-xs sm:text-sm font-sans font-medium active:scale-95 transition-all shadow-lg backdrop-blur-md"
              >
                <span>Wróć</span>
              </button>
            </div>
          </>
        ) : (
          <div className="my-auto max-w-lg w-full text-center flex flex-col items-center py-8 z-10">
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
