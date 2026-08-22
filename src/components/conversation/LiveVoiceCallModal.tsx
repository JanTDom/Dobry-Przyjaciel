"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Flame, CloudRain, Waves, Sparkles, Volume2, VolumeX, MessageSquare } from "lucide-react";
import { LivingWarmHearth } from "@/components/presence/LivingWarmHearth";
import { voiceEngine } from "@/lib/voice-engine";
import { soundscapeEngine, SoundscapeType } from "@/lib/audio-synthesizer";
import { generateCompanionReply } from "@/lib/companion-personality";
import { UserProfile, Message } from "@/types";

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
  const [liveTranscript, setLiveTranscript] = useState("");
  const [companionText, setCompanionText] = useState(
    `Cześć ${profile.name}. Jestem przy tobie. Usiądź wygodnie i mów do mnie swobodnie — słucham cię.`
  );
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType | null>("fireplace");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const durationTimerRef = useRef<any>(null);

  // Inicjalizacja połączenia głosowego
  useEffect(() => {
    if (!isOpen) {
      voiceEngine.stopLiveDialogue();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      return;
    }

    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Włącz ciepły kominek w tle
    if (activeSoundscape) {
      soundscapeEngine.play(activeSoundscape);
      soundscapeEngine.setVolume(0.25);
    }

    // Uruchomienie pierwszej powitalnej kwestii
    setTimeout(() => {
      voiceEngine.speak(
        `Cześć ${profile.name}. Jestem przy tobie. Usiądź wygodnie i mów do mnie swobodnie — słucham cię.`
      );
    }, 500);

    // Rejestracja callbacków ciągłego nasłuchu i generowania odpowiedzi
    voiceEngine.setCallbacks(
      (capturedUserText: string) => {
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
        setLiveTranscript(capturedUserText);

        // Generowanie empatycznej odpowiedzi Przyjaciela
        const reply = generateCompanionReply(capturedUserText, profile);
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

        // Odtwarzanie głosu przyjaciela
        voiceEngine.speak(reply.text);
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
  }, [isOpen]);

  const handleToggleSoundscape = (type: SoundscapeType) => {
    if (activeSoundscape === type) {
      soundscapeEngine.stop();
      setActiveSoundscape(null);
    } else {
      soundscapeEngine.play(type);
      soundscapeEngine.setVolume(0.25);
      setActiveSoundscape(type);
    }
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
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-sanctuary-950/98 backdrop-blur-2xl px-6 py-8 select-none text-sanctuary-100"
      >
        {/* Górny pasek statusu */}
        <div className="w-full max-w-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-hearth-500 animate-ping" />
            <div className="text-xs text-sanctuary-400 font-sans tracking-wide">
              Rozmowa na żywo z {profile.companionName} • {formatDuration(callDuration)}
            </div>
          </div>

          {/* Dźwięki otoczenia w rozmowie */}
          <div className="flex items-center gap-1.5 bg-sanctuary-900/80 border border-sanctuary-700/60 rounded-full px-3 py-1">
            <button
              onClick={() => handleToggleSoundscape("fireplace")}
              className={`p-1.5 rounded-full transition-all ${
                activeSoundscape === "fireplace"
                  ? "bg-hearth-600/30 text-hearth-300 border border-hearth-500/40"
                  : "text-sanctuary-500 hover:text-sanctuary-300"
              }`}
              title="Trzaskający kominek"
            >
              <Flame size={14} />
            </button>
            <button
              onClick={() => handleToggleSoundscape("rain")}
              className={`p-1.5 rounded-full transition-all ${
                activeSoundscape === "rain"
                  ? "bg-hearth-600/30 text-hearth-300 border border-hearth-500/40"
                  : "text-sanctuary-500 hover:text-sanctuary-300"
              }`}
              title="Kojący deszcz"
            >
              <CloudRain size={14} />
            </button>
            <button
              onClick={() => handleToggleSoundscape("alpha_waves")}
              className={`p-1.5 rounded-full transition-all ${
                activeSoundscape === "alpha_waves"
                  ? "bg-hearth-600/30 text-hearth-300 border border-hearth-500/40"
                  : "text-sanctuary-500 hover:text-sanctuary-300"
              }`}
              title="Fale alfa 8Hz"
            >
              <Waves size={14} />
            </button>
          </div>
        </div>

        {/* Centralne żywe ognisko i status obecności */}
        <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg w-full">
          <div className="relative mb-6">
            <LivingWarmHearth
              isListening={isListening}
              isSpeaking={isSpeaking}
              size={320}
              intensity={isSpeaking ? 0.8 : isListening ? 0.4 : 0.2}
            />
          </div>

          {/* Dynamiczny stan */}
          <motion.div
            key={isSpeaking ? "speaking" : isListening ? "listening" : "idle"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium tracking-wider uppercase text-hearth-400 mb-4"
          >
            {isSpeaking
              ? `${profile.companionName} mówi...`
              : isListening
              ? "Słucham cię uważnie..."
              : "Jestem przy tobie"}
          </motion.div>

          {/* Tekst wypowiedzi / transkrypcja na żywo */}
          <div className="min-h-[100px] flex items-center justify-center px-4">
            <p className="font-serif text-lg md:text-xl text-sanctuary-100 leading-relaxed max-w-md">
              {isSpeaking
                ? companionText
                : liveTranscript
                ? `„${liveTranscript}”`
                : "Mów śmiało. Nie musisz niczego klikać, po prostu opowiedz mi o swoim dniu."}
            </p>
          </div>
        </div>

        {/* Dolny panel sterowania rozmową */}
        <div className="w-full max-w-md flex items-center justify-center gap-6 pt-6 border-t border-sanctuary-800/60">
          {/* Wyciszenie mikrofonu */}
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
            className={`p-4 rounded-full transition-all ${
              isListening
                ? "bg-sanctuary-850 text-sanctuary-200 hover:bg-sanctuary-800 border border-sanctuary-700"
                : "bg-rosewood-600/30 text-rosewood-400 border border-rosewood-500/50"
            }`}
            title={isListening ? "Wycisz mikrofon" : "Włącz mikrofon"}
          >
            {isListening ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          {/* Zakończenie rozmowy */}
          <button
            onClick={onClose}
            className="flex items-center gap-3 bg-rosewood-600 hover:bg-rosewood-500 text-white font-medium px-8 py-4 rounded-full shadow-lg shadow-rosewood-600/30 transition-all active:scale-95"
          >
            <PhoneOff size={20} />
            <span className="text-sm tracking-wide">Zakończ rozmowę</span>
          </button>

          {/* Przełącz na pisanie */}
          <button
            onClick={onClose}
            className="p-4 rounded-full bg-sanctuary-850 text-sanctuary-200 hover:bg-sanctuary-800 border border-sanctuary-700 transition-all"
            title="Przejdź do cichego pisania"
          >
            <MessageSquare size={22} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
