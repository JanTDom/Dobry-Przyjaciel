"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export const BreathingGuide: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"Wdech" | "Zatrzymaj" | "Wydech" | "Spokój">("Wdech");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === "Wdech") {
          triggerHaptic("breath_in");
          setPhase("Zatrzymaj");
          return 4;
        } else if (phase === "Zatrzymaj") {
          triggerHaptic("light");
          setPhase("Wydech");
          return 4;
        } else if (phase === "Wydech") {
          triggerHaptic("breath_out");
          setPhase("Spokój");
          return 4;
        } else {
          triggerHaptic("medium");
          setPhase("Wdech");
          setCompletedCycles((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleToggle = () => {
    setIsActive(!isActive);
    triggerHaptic("medium");
    if (!isActive) {
      setPhase("Wdech");
      setSecondsLeft(4);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    triggerHaptic("light");
    setPhase("Wdech");
    setSecondsLeft(4);
    setCompletedCycles(0);
  };

  return (
    <div className="quiet-surface rounded-surface p-6 sm:p-10 flex flex-col items-center text-center max-w-lg mx-auto border-ink/8">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-paper-dark flex items-center justify-center text-warm-amber">
          <Wind size={16} strokeWidth={1.75} />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
          Spokojny oddech 4-4-4-4
        </h2>
      </div>
      <p className="font-sans text-xs sm:text-sm text-ink-muted max-w-sm mb-8 leading-relaxed">
        Prosty, 4-fazowy rytm, który pomaga wyciszyć gonitwę myśli i przywrócić poczucie spokoju.
      </p>

      <div className="relative w-56 h-56 flex items-center justify-center mb-8">
        <motion.div
          animate={{
            scale:
              phase === "Wdech"
                ? [1, 1.25]
                : phase === "Zatrzymaj"
                ? 1.25
                : phase === "Wydech"
                ? [1.25, 1]
                : 1,
            opacity: phase === "Zatrzymaj" || phase === "Wdech" ? 0.7 : 0.3,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-warm-amber/20 via-warm-apricot/25 to-warm-sage/20 blur-xl"
        />

        <div className="relative z-10 flex flex-col items-center justify-center rounded-full w-44 h-44 bg-paper-surface border border-ink/10 shadow-quiet-sm">
          <span className="font-serif text-xl text-ink font-medium tracking-wide mb-1">
            {phase}
          </span>
          <span className="font-sans text-2xl font-light text-ink-muted">
            {secondsLeft}s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className="presence-btn-primary flex items-center gap-2 font-sans font-medium text-xs px-7 py-3.5 rounded-full active:scale-95 transition-all shadow-quiet-md"
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
          <span>{isActive ? "Wstrzymaj ćwiczenie" : "Rozpocznij oddech"}</span>
        </button>

        {isActive && (
          <button
            onClick={handleReset}
            className="presence-btn-secondary p-3 rounded-full text-ink-muted hover:text-ink"
            title="Resetuj oddech"
          >
            <RotateCcw size={15} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {completedCycles > 0 && (
        <span className="text-[11px] font-sans text-ink-subtle mt-4">
          Ukończone cykle: {completedCycles}
        </span>
      )}
    </div>
  );
};
