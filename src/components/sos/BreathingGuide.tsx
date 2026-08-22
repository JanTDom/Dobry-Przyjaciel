"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wind, Play, RotateCcw } from "lucide-react";

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
          setPhase("Zatrzymaj");
          return 4;
        } else if (phase === "Zatrzymaj") {
          setPhase("Wydech");
          return 4;
        } else if (phase === "Wydech") {
          setPhase("Spokój");
          return 4;
        } else {
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
    if (!isActive) {
      setPhase("Wdech");
      setSecondsLeft(4);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("Wdech");
    setSecondsLeft(4);
    setCompletedCycles(0);
  };

  return (
    <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-xl bg-sun-100 text-sun-600">
          <Wind size={18} />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal">
          Oddech pudełkowy na obniżenie kortyzolu
        </h2>
      </div>
      <p className="font-sans text-xs sm:text-sm text-cream-700 max-w-sm mb-8">
        Spokojny, 4-fazowy rytm oddechu fizjologicznie uspokaja twój układ nerwowy
      </p>

      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <motion.div
          animate={{
            scale:
              phase === "Wdech"
                ? [1, 1.35]
                : phase === "Zatrzymaj"
                ? 1.35
                : phase === "Wydech"
                ? [1.35, 1]
                : 1,
            opacity: phase === "Zatrzymaj" || phase === "Wdech" ? 0.85 : 0.45,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-sun-400/30 via-amber-300/40 to-yellow-200/30 blur-2xl"
        />

        <div className="relative z-10 flex flex-col items-center justify-center rounded-full w-48 h-48 bg-white border border-sun-300 shadow-warm-md">
          <span className="font-serif text-2xl text-sun-900 font-medium tracking-wide mb-1">
            {phase}
          </span>
          <span className="font-sans text-3xl font-light text-cream-900">
            {secondsLeft}s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className="hearth-button flex items-center gap-2 font-sans font-semibold text-xs px-7 py-3 rounded-full active:scale-95 transition-all shadow-md shadow-sun-500/20"
        >
          <Play size={14} className={isActive ? "rotate-90" : ""} />
          <span>{isActive ? "Wstrzymaj ćwiczenie" : "Rozpocznij oddech"}</span>
        </button>

        {completedCycles > 0 && (
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-cream-100 border border-cream-300 text-cream-700 hover:text-cream-900 transition-all"
            title="Zresetuj licznik"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>

      {completedCycles > 0 && (
        <span className="text-xs text-cream-600 font-sans mt-4 font-medium">
          Ukończone cykle: {completedCycles}
        </span>
      )}
    </div>
  );
};
