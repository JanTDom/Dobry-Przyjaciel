"use client";

import React, { useState } from "react";
import { Play, Pause, Volume2, Sparkles, Check, User } from "lucide-react";
import { voiceEngine } from "@/lib/voice-engine";

interface VoiceOption {
  id: string;
  category: "Głos żeński" | "Głos męski";
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
    category: "Głos żeński",
    name: "Ciepły i kojący",
    gender: "female",
    tone: "Bliska, serdeczna i spokojna obecność",
    sampleText: "Jestem przy Tobie. Nie musisz dziś niczego udowadniać — usiądź wygodnie i odpocznij.",
    voiceName: "nova",
    accentColor: "from-amber-400 to-yellow-500",
  },
  {
    id: "v_soft_female",
    category: "Głos żeński",
    name: "Łagodny i miękki",
    gender: "female",
    tone: "Delikatny, wyciszający i empatyczny",
    sampleText: "Każda trudna chwila w końcu mija. Oddychaj powoli, jestem obok Ciebie.",
    voiceName: "shimmer",
    accentColor: "from-yellow-400 to-amber-500",
  },
  {
    id: "v_deep_male",
    category: "Głos męski",
    name: "Głęboki i spokojny",
    gender: "male",
    tone: "Głęboki, wyważony, uziemiający",
    sampleText: "Spokojnie. Zostawmy za drzwiami cały pośpiech dzisiejszego dnia. Słucham Cię.",
    voiceName: "echo",
    accentColor: "from-amber-500 to-orange-600",
  },
  {
    id: "v_warm_male",
    category: "Głos męski",
    name: "Życzliwy i wyważony",
    gender: "male",
    tone: "Mądry, przyjacielski i stabilny",
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
            Wybierz brzmienie głosu swojego Przyjaciela.
          </h3>
        </div>
        <p className="text-xs text-ink-muted font-sans max-w-xs">
          Odsłuchaj barwy żeńskie i męskie. Imię dla swojej postaci wybierzesz samodzielnie.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="region" aria-label="Katalog głosów do wyboru">
        {VOICES.map((v) => {
          const isPlaying = playingVoiceId === v.id;
          const isCurrentChoice = activeVoiceName === v.voiceName;
          const isFemale = v.gender === "female";

          return (
            <div
              key={v.id}
              tabIndex={0}
              role="button"
              aria-label={`Głos ${v.name}, ${v.category}. ${isPlaying ? "Trwa odtwarzanie" : "Dotknij, aby odsłuchać"}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTogglePlay(v);
                }
              }}
              onClick={() => handleTogglePlay(v)}
              className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative group cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
                isPlaying
                  ? "bg-white border-warm-amber shadow-quiet-lg ring-2 ring-warm-amber/30"
                  : "bg-paper-surface/90 hover:bg-white border-ink/8 hover:border-warm-amber/30 shadow-quiet-sm"
              }`}
            >
              <div>
                {/* Wyrazista, czytelna etykieta płci głosu */}
                <div className="flex items-center justify-between mb-3.5">
                  <span
                    className={`text-[11px] font-sans font-semibold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      isFemale
                        ? "bg-amber-100/80 text-amber-900 border-amber-300/70"
                        : "bg-stone-200/80 text-stone-800 border-stone-300"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFemale ? "bg-warm-amber" : "bg-stone-600"
                      }`}
                    />
                    {v.category}
                  </span>

                  {/* Wskaźnik animowanej fali dźwiękowej */}
                  {isPlaying && (
                    <div className="flex items-center gap-1 h-6 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300" aria-label="Odtwarzanie dźwięku">
                      <span className="w-1 bg-warm-amber rounded-full animate-[pulse_0.6s_infinite_100ms] h-3 gpu-layer" />
                      <span className="w-1 bg-warm-amber rounded-full animate-[pulse_0.6s_infinite_300ms] h-4 gpu-layer" />
                      <span className="w-1 bg-warm-amber rounded-full animate-[pulse_0.6s_infinite_200ms] h-2.5 gpu-layer" />
                      <span className="w-1 bg-warm-amber rounded-full animate-[pulse_0.6s_infinite_400ms] h-3.5 gpu-layer" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3.5 mb-3">
                  {/* Przycisk odtwarzania */}
                  <button
                    type="button"
                    aria-label={isPlaying ? `Zatrzymaj odsłuchiwanie głosu: ${v.name}` : `Odsłuchaj próbkę głosu: ${v.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(v);
                    }}
                    className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-quiet-sm flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
                      isPlaying
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold"
                        : "bg-paper-dark group-hover:bg-amber-100 text-ink-muted group-hover:text-warm-amber"
                    }`}
                    title={isPlaying ? "Zatrzymaj" : "Odsłuchaj ten głos"}
                  >
                    {isPlaying ? (
                      <Pause size={17} strokeWidth={2} className="animate-pulse" />
                    ) : (
                      <Play size={17} strokeWidth={2} className="ml-0.5" />
                    )}
                  </button>

                  <div>
                    <h4 className="font-serif text-lg text-ink font-medium leading-snug">
                      {v.name}
                    </h4>
                    <span className="text-xs text-warm-amber font-sans font-medium">
                      {v.tone}
                    </span>
                  </div>
                </div>

                <p className="font-serif text-sm text-ink-muted italic leading-relaxed pl-1">
                  „{v.sampleText}”
                </p>
              </div>

              {onSelectVoice && (
                <div className="pt-3.5 mt-3.5 border-t border-ink/8 flex items-center justify-between">
                  <span className="text-[11px] text-ink-subtle font-sans">
                    {isCurrentChoice ? "Twój obecny wybór" : "Dotknij, aby wybrać ten tembr"}
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
