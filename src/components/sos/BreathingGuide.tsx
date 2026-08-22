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

        // Przejście do kolejnej fazy (4s na fazę)
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
    <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-sanctuary-700/60 shadow-2xl flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-hearth-500/15 text-hearth-400">
          <Wind size={16} />
        </div>
        <h2 className="font-serif text-xl sm:text-2xl text-sanctuary-100 font-normal">
          Oddech pudełkowy na obniżenie kortyzolu
        </h2>
      </div>
      <p className="font-sans text-xs text-sanctuary-400 max-w-sm mb-8">
        Spokojny, 4-fazowy rytm oddechu fizjologicznie uspokaja twój układ nerwowy
      </p>

      {/* Wizualizacja pulsującego okręgu oddechu */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <motion.div
          animate={{
            scale:
              phase === "Wdech"
                ? [1, 1.4]
                : phase === "Zatrzymaj"
                ? 1.4
                : phase === "Wydech"
                ? [1.4, 1]
                : 1,
            opacity: phase === "Zatrzymaj" || phase === "Wdech" ? 0.9 : 0.6,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-hearth-600/20 via-hearth-500/30 to-hearth-300/10 blur-xl"
        />

        <div className="relative z-10 flex flex-col items-center justify-center rounded-full w-48 h-48 bg-sanctuary-900/90 border border-hearth-500/40 shadow-inner">
          <span className="font-serif text-2xl text-hearth-200 font-medium tracking-wide mb-1">
            {phase}
          </span>
          <span className="font-sans text-3xl font-light text-sanctuary-100">
            {secondsLeft}s
          </span>
        </div>
      </div>

      {/* Przyciski sterowania */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className="hearth-button flex items-center gap-2 text-sanctuary-950 font-sans font-medium text-xs px-6 py-3 rounded-full active:scale-95 transition-all"
        >
          <Play size={14} className={isActive ? "rotate-90" : ""} />
          <span>{isActive ? "Wstrzymaj ćwiczenie" : "Rozpocznij oddech"}</span>
        </button>

        {completedCycles > 0 && (
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-sanctuary-900 border border-sanctuary-800 text-sanctuary-400 hover:text-sanctuary-200 transition-all"
            title="Zresetuj licznik"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {completedCycles > 0 && (
        <span className="text-xs text-sanctuary-400 font-sans mt-4">
          Ukończone cykle: {completedCycles}
        </span>
      )}
    </div>
  );
};
