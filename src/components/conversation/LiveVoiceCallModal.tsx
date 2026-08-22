"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Flame, CloudRain, Waves, Sparkles, MessageSquare } from "lucide-react";
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
  const [callDuration, setCallDuration] = useState(0);

  const durationTimerRef = useRef<any>(null);

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

    if (activeSoundscape) {
      soundscapeEngine.play(activeSoundscape);
      soundscapeEngine.setVolume(0.25);
    }

    setTimeout(() => {
      voiceEngine.speak(
        `Cześć ${profile.name}. Jestem przy tobie. Usiądź wygodnie i mów do mnie swobodnie — słucham cię.`
      );
    }, 400);

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
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-amber-50/98 via-cream-100/98 to-orange-50/95 backdrop-blur-2xl px-6 py-8 select-none text-cream-950"
      >
        {/* Górny pasek statusu */}
        <div className="w-full max-w-xl flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white/80 border border-cream-300 px-4 py-1.5 rounded-full shadow-warm-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs text-cream-700 font-sans tracking-wide font-medium">
              Rozmowa na żywo z {profile.companionName} • {formatDuration(callDuration)}
            </div>
          </div>

          {/* Dźwięki otoczenia w rozmowie */}
          <div className="flex items-center gap-1.5 bg-white/80 border border-cream-300 rounded-full px-3 py-1 shadow-warm-sm">
            <button
              onClick={() => handleToggleSoundscape("fireplace")}
              className={`p-1.5 rounded-full transition-all ${
                activeSoundscape === "fireplace"
                  ? "bg-sun-100 text-sun-700 border border-sun-300"
                  : "text-cream-400 hover:text-cream-700"
              }`}
              title="Trzaskający kominek"
            >
              <Flame size={15} />
            </button>
            <button
              onClick={() => handleToggleSoundscape("rain")}
              className={`p-1.5 rounded-full transition-all ${
                activeSoundscape === "rain"
                  ? "bg-sky-100 text-sky-700 border border-sky-300"
                  : "text-cream-400 hover:text-cream-700"
              }`}
              title="Kojący deszcz"
            >
              <CloudRain size={15} />
            </button>
            <button
              onClick={() => handleToggleSoundscape("alpha_waves")}
              className={`p-1.5 rounded-full transition-all ${
                activeSoundscape === "alpha_waves"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "text-cream-400 hover:text-cream-700"
              }`}
              title="Fale alfa 8Hz"
            >
              <Waves size={15} />
            </button>
          </div>
        </div>

        {/* Centralne słoneczne światło i status obecności */}
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
            className="text-xs font-semibold tracking-wider uppercase text-sun-700 mb-4 bg-sun-100/80 px-4 py-1 rounded-full border border-sun-300/60"
          >
            {isSpeaking
              ? `${profile.companionName} mówi...`
              : isListening
              ? "Słucham cię uważnie..."
              : "Jestem przy tobie"}
          </motion.div>

          {/* Tekst wypowiedzi / transkrypcja na żywo */}
          <div className="min-h-[100px] flex items-center justify-center px-4">
            <p className="font-serif text-lg md:text-2xl text-cream-950 leading-relaxed max-w-md">
              {isSpeaking
                ? companionText
                : liveTranscript
                ? `„${liveTranscript}”`
                : "Mów śmiało. Nie musisz niczego klikać, po prostu opowiedz mi o swoim dniu."}
            </p>
          </div>
        </div>

        {/* Dolny panel sterowania rozmową */}
        <div className="w-full max-w-md flex items-center justify-center gap-6 pt-6 border-t border-cream-300/80">
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
            className={`p-4 rounded-full transition-all shadow-warm-sm ${
              isListening
                ? "bg-white text-cream-800 hover:bg-cream-100 border border-cream-300"
                : "bg-rose-100 text-rose-700 border border-rose-300"
            }`}
            title={isListening ? "Wycisz mikrofon" : "Włącz mikrofon"}
          >
            {isListening ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          {/* Zakończenie rozmowy */}
          <button
            onClick={onClose}
            className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 text-white font-medium px-8 py-4 rounded-full shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <PhoneOff size={20} />
            <span className="text-sm tracking-wide">Zakończ rozmowę</span>
          </button>

          {/* Przełącz na pisanie */}
          <button
            onClick={onClose}
            className="p-4 rounded-full bg-white text-cream-800 hover:bg-cream-100 border border-cream-300 shadow-warm-sm transition-all"
            title="Przejdź do cichego pisania"
          >
            <MessageSquare size={22} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
