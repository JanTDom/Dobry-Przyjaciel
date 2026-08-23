"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Wind, Flame, Sun, Sparkles, PhoneCall, Volume2, ArrowRight } from "lucide-react";

export type EmotionalMoodKey = "overwhelmed" | "lonely" | "vent" | "seeking_peace";

interface EmotionalMood {
  key: EmotionalMoodKey;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  companionResponse: string;
  actionPrompt: string;
}

const MOODS: EmotionalMood[] = [
  {
    key: "overwhelmed",
    label: "Mam mętlik w głowie",
    sublabel: "Za dużo myśli i pośpiechu",
    icon: Wind,
    colorClass: "bg-amber-500/10 text-amber-900 border-amber-500/30",
    borderClass: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    companionResponse: "Zwolnijmy na chwilę. Nie musisz teraz układać wszystkiego w logiczny ciąg. Po prostu opowiedz mi o pierwszej myśli, która przychodzi Ci do głowy.",
    actionPrompt: "Zacznijmy od jednego spokojnego oddechu. Co teraz najbardziej Ci ciąży?",
  },
  {
    key: "lonely",
    label: "Czuję samotność",
    sublabel: "Chcę poczuć, że ktoś jest obok",
    icon: CloudRain,
    colorClass: "bg-amber-500/10 text-amber-900 border-amber-500/30",
    borderClass: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    companionResponse: "Jestem tutaj. Nie jesteś sam ze swoimi emocjami. Zaparzmy coś ciepłego i zostańmy przez chwilę w tym pokoju.",
    actionPrompt: "Nie musisz być dzisiaj silny. Jestem przy Tobie — o czym chcesz porozmawiać?",
  },
  {
    key: "vent",
    label: "Muszę się wygadać",
    sublabel: "Bez oceniania i dobrych rad",
    icon: Flame,
    colorClass: "bg-amber-500/10 text-amber-900 border-amber-500/30",
    borderClass: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    companionResponse: "Słucham Cię z całą uwagą. Wyrzuć to z siebie — bez cenzury, bez układania słów. Masz do tego pełne prawo.",
    actionPrompt: "Zrzuć ze swoich barków wszystko, co się dziś nagromadziło. Słucham Cię.",
  },
  {
    key: "seeking_peace",
    label: "Szukam chwili ukojenia",
    sublabel: "Chcę po prostu posłuchać głosu",
    icon: Sun,
    colorClass: "bg-amber-500/10 text-amber-900 border-amber-500/30",
    borderClass: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    companionResponse: "Oddychaj powoli. Usiądź wygodnie, opuść ramiona. Świat za drzwiami może poczekać kilka minut.",
    actionPrompt: "Zostańmy w tej ciszy. Opowiem Ci coś spokojnego lub po prostu posłuchamy tła.",
  },
];

interface EmotionalWeatherSelectorProps {
  onSelectMoodAction: (mood: EmotionalMood) => void;
  companionName?: string;
}

export const EmotionalWeatherSelector: React.FC<EmotionalWeatherSelectorProps> = ({
  onSelectMoodAction,
  companionName = "Agata",
}) => {
  const [selectedMood, setSelectedMood] = useState<EmotionalMood>(MOODS[0]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-1">
            Stan wewnętrzny
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-ink font-normal tracking-tight">
            Z czym dzisiaj do mnie przychodzisz?
          </h3>
        </div>
        <span className="text-xs text-ink-muted font-sans hidden sm:inline">
          Dotknij, aby zmienić nastrój
        </span>
      </div>

      {/* 4 interaktywne kafelki nastroju */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {MOODS.map((m) => {
          const isSelected = selectedMood.key === m.key;
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMood(m)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative group cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-white/95 border-warm-amber ring-2 ring-warm-amber/30 shadow-quiet-md"
                  : "bg-paper-surface/80 hover:bg-white/90 border-ink/8 hover:border-warm-amber/30 shadow-quiet-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? "bg-amber-100 text-warm-amber" : "bg-paper-dark text-ink-muted group-hover:text-warm-amber"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="active-mood-dot"
                    className="w-2 h-2 rounded-full bg-warm-amber animate-pulse shadow-[0_0_8px_#F59E0B]"
                  />
                )}
              </div>
              <div>
                <span className="font-serif text-xs sm:text-sm font-medium text-ink block leading-snug mb-0.5">
                  {m.label}
                </span>
                <span className="text-[10px] text-ink-muted font-sans line-clamp-1">
                  {m.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamiczna, luksusowa odpowiedź i zaproszenie do rozmowy */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMood.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-white/90 backdrop-blur-xl border border-warm-amber/25 rounded-3xl p-5 sm:p-7 shadow-quiet-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden"
        >
          {/* Delikatna poświata w tle */}
          <div
            aria-hidden
            className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-warm-amber/10 blur-2xl pointer-events-none"
          />

          <div className="max-w-lg flex-1">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-warm-amber font-sans">
              <Sparkles size={13} />
              <span>{companionName} odpowiada na Twój stan:</span>
            </div>
            <p className="font-serif text-base sm:text-lg text-ink italic leading-relaxed mb-1">
              „{selectedMood.companionResponse}”
            </p>
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              {selectedMood.actionPrompt}
            </p>
          </div>

          <button
            onClick={() => onSelectMoodAction(selectedMood)}
            className="presence-btn-primary flex items-center gap-2 font-sans font-medium text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-quiet-md active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
          >
            <PhoneCall size={14} className="animate-pulse text-warm-honey" />
            <span>Porozmawiajmy o tym</span>
            <ArrowRight size={13} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
