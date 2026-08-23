"use client";

import React, { useState } from "react";
import { Play, Pause, Volume2, Sparkles, Check } from "lucide-react";
import { voiceEngine } from "@/lib/voice-engine";

interface VoiceOption {
  id: string;
  name: string;
  gender: "female" | "male";
  tone: string;
  sampleText: string;
  voiceName: string;
  accentColor: string;
}

const VOICES: VoiceOption[] = [
  {
    id: "v_warm_female",
    name: "Tembr ciepły i kojący",
    gender: "female",
    tone: "Ciepły, bliski, spokojna obecność",
    sampleText: "Jestem przy Tobie. Nie musisz dziś niczego udowadniać — usiądź wygodnie i odpocznij.",
    voiceName: "nova",
    accentColor: "from-amber-400 to-yellow-500",
  },
  {
    id: "v_deep_male",
    name: "Tembr głęboki i spokojny",
    gender: "male",
    tone: "Głęboki, wyważony, uziemiający",
    sampleText: "Spokojnie. Zostawmy za drzwiami cały pośpiech dzisiejszego dnia. Słucham Cię.",
    voiceName: "echo",
    accentColor: "from-amber-500 to-orange-600",
  },
  {
    id: "v_soft_female",
    name: "Tembr łagodny i miękki",
    gender: "female",
    tone: "Delikatny, empatyczny, wyciszający",
    sampleText: "Każda trudna chwila w końcu mija. Oddychaj powoli, jestem obok Ciebie.",
    voiceName: "shimmer",
    accentColor: "from-yellow-400 to-amber-500",
  },
  {
    id: "v_warm_male",
    name: "Tembr życzliwy i wyważony",
    gender: "male",
    tone: "Życzliwy, mądry, przyjacielski",
    sampleText: "Pamiętam, ile już przeszedłeś. Masz w sobie siłę, by poradzić sobie z tym wszystkim.",
    voiceName: "onyx",
    accentColor: "from-amber-600 to-amber-700",
  },
];

interface VoiceAuditionStudioProps {
  onSelectVoice?: (voice: VoiceOption) => void;
  activeVoiceName?: string;
}

export const VoiceAuditionStudio: React.FC<VoiceAuditionStudioProps> = ({
  onSelectVoice,
  activeVoiceName = "nova",
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handleTogglePlay = (v: VoiceOption) => {
    if (playingVoiceId === v.id) {
      voiceEngine.stopSpeaking();
      setPlayingVoiceId(null);
    } else {
      voiceEngine.unlock();
      setPlayingVoiceId(v.id);
      voiceEngine.speak(
        v.sampleText,
        () => {
          setPlayingVoiceId(null);
        },
        v.voiceName,
        true
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-1">
            Głos i brzmienie
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight">
            Wybierz tembr, w którym poczujesz spokój.
          </h3>
        </div>
        <p className="text-xs text-ink-muted font-sans max-w-xs">
          Dotknij, aby odsłuchać próbkę brzmienia. Swojemu Przyjacielowi nadasz własne, wybrane imię.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {VOICES.map((v) => {
          const isPlaying = playingVoiceId === v.id;
          const isCurrentChoice = activeVoiceName === v.voiceName;

          return (
            <div
              key={v.id}
              onClick={() => handleTogglePlay(v)}
              className={`p-5 rounded-2xl border transition-all duration-300 relative group cursor-pointer flex flex-col justify-between ${
                isPlaying
                  ? "bg-white border-warm-amber shadow-quiet-lg ring-2 ring-warm-amber/30"
                  : "bg-paper-surface/90 hover:bg-white border-ink/8 hover:border-warm-amber/30 shadow-quiet-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Przycisk odtwarzania z animacją fali */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlay(v);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-quiet-sm ${
                        isPlaying
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold"
                          : "bg-paper-dark group-hover:bg-amber-100 text-ink-muted group-hover:text-warm-amber"
                      }`}
                      title={isPlaying ? "Zatrzymaj" : "Odsłuchaj tembr głosu"}
                    >
                      {isPlaying ? (
                        <Pause size={16} strokeWidth={2} className="animate-pulse" />
                      ) : (
                        <Play size={16} strokeWidth={2} className="ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base sm:text-lg text-ink font-medium">
                          {v.name}
                        </span>
                      </div>
                      <span className="text-xs text-warm-amber font-sans font-medium">
                        {v.tone}
                      </span>
                    </div>
                  </div>

                  {/* Wskaźnik animowanej fali dźwiękowej */}
                  {isPlaying && (
                    <div className="flex items-center gap-1 h-5 px-2.5 py-1 rounded-full bg-amber-100/90 border border-amber-300">
                      <span className="w-1 bg-warm-amber rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
                      <span className="w-1 bg-warm-amber rounded-full animate-[bounce_0.6s_infinite_300ms] h-4" />
                      <span className="w-1 bg-warm-amber rounded-full animate-[bounce_0.6s_infinite_200ms] h-2.5" />
                      <span className="w-1 bg-warm-amber rounded-full animate-[bounce_0.6s_infinite_400ms] h-3.5" />
                    </div>
                  )}
                </div>

                <p className="font-serif text-sm text-ink-muted italic leading-relaxed">
                  „{v.sampleText}”
                </p>
              </div>

              {onSelectVoice && (
                <div className="pt-3 mt-3 border-t border-ink/8 flex items-center justify-between">
                  <span className="text-[11px] text-ink-subtle font-sans">
                    {isCurrentChoice ? "Twój obecny wybór" : "Kliknij, aby wybrać ten tembr"}
                  </span>
                  {isCurrentChoice && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold font-sans">
                      <Check size={13} />
                      <span>Aktywny</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
