"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Heart, ShieldAlert } from "lucide-react";

type BreathPhase = "inhale" | "holdIn" | "exhale" | "holdOut";

export const BreathingGuide: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Box Breathing: Inhale 4s -> Hold 4s -> Exhale 4s -> Hold 4s
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (phase === "inhale") {
              setPhase("holdIn");
              return 4;
            } else if (phase === "holdIn") {
              setPhase("exhale");
              return 4;
            } else if (phase === "exhale") {
              setPhase("holdOut");
              return 4;
            } else {
              setPhase("inhale");
              setCyclesCompleted((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleReset = () => {
    setIsActive(false);
    setPhase("inhale");
    setCountdown(4);
    setCyclesCompleted(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Głęboki wdech przez nos...";
      case "holdIn":
        return "Zatrzymaj powietrze w klatce...";
      case "exhale":
        return "Spokojny, długi wydech ustami...";
      case "holdOut":
        return "Cisza i spokój przed wdechem...";
    }
  };

  const getScale = () => {
    switch (phase) {
      case "inhale":
        return "scale-125";
      case "holdIn":
        return "scale-125";
      case "exhale":
        return "scale-90";
      case "holdOut":
        return "scale-90";
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider mb-6">
        <ShieldAlert className="w-3.5 h-3.5" />
        Oddech Pudełkowy (Redukcja Kortyzolu)
      </div>

      {/* Visual Breathing Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center my-6">
        {/* Ambient Ring */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500/20 via-teal-400/20 to-indigo-500/20 blur-2xl transition-all duration-[4000ms] ${
            isActive ? getScale() : "scale-100"
          }`}
        />

        {/* Outer Animated Border */}
        <div
          className={`w-52 h-52 rounded-full border-2 border-teal-400/40 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
            isActive ? getScale() : "scale-100"
          }`}
        >
          {/* Inner Core Ball */}
          <div
            className={`w-36 h-36 rounded-full bg-gradient-to-tr from-teal-500 via-sky-400 to-indigo-500 flex flex-col items-center justify-center shadow-2xl text-white transition-all duration-[4000ms] ${
              isActive ? "shadow-[0_0_50px_rgba(45,212,191,0.5)]" : ""
            }`}
          >
            <span className="text-4xl font-bold font-mono tracking-tight">{countdown}</span>
            <span className="text-[11px] font-medium uppercase tracking-widest opacity-80 mt-1">sekund</span>
          </div>
        </div>
      </div>

      {/* Instruction text */}
      <p className="text-base sm:text-lg font-medium text-slate-100 text-center min-h-[32px] transition-all">
        {isActive ? getPhaseText() : "Naciśnij start, aby wyrównać rytm serca"}
      </p>

      <div className="text-xs text-slate-400 mt-2">
        Ukończone cykle oddechowe: <span className="text-teal-300 font-bold">{cyclesCompleted}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
            isActive
              ? "bg-surface-100 text-amber-300 border border-amber-500/30"
              : "bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 hover:opacity-95"
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          <span>{isActive ? "Wstrzymaj" : "Rozpocznij Oddech"}</span>
        </button>

        <button
          onClick={handleReset}
          className="p-3 rounded-2xl bg-surface-100 text-slate-400 hover:text-white border border-white/5 transition-colors"
          title="Resetuj"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
