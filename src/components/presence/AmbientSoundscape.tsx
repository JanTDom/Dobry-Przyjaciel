"use client";

import React, { useState, useEffect } from "react";
import { CloudRain, Waves, Sparkles, Trees, Volume2, VolumeX } from "lucide-react";
import { ambientEngine } from "@/lib/audio-synthesizer";
import { AmbientSoundType } from "@/types";

export const AmbientSoundscape: React.FC = () => {
  const [activeSound, setActiveSound] = useState<AmbientSoundType>("none");
  const [volume, setVolume] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const soundOptions: { type: AmbientSoundType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: "none", label: "Cisza", icon: <VolumeX className="w-3.5 h-3.5" />, desc: "Tylko głos" },
    { type: "rain", label: "Cichy Deszcz", icon: <CloudRain className="w-3.5 h-3.5" />, desc: "Krople na szybie" },
    { type: "ocean", label: "Fale Oceanu", icon: <Waves className="w-3.5 h-3.5" />, desc: "Spokojny przypływ" },
    { type: "alpha_drone", label: "Fale Alfa 8Hz", icon: <Sparkles className="w-3.5 h-3.5" />, desc: "Redukcja lęku" },
    { type: "night_forest", label: "Nocny Las", icon: <Trees className="w-3.5 h-3.5" />, desc: "Kojąca atmosfera" },
  ];

  const handleSelectSound = (type: AmbientSoundType) => {
    if (activeSound === type) {
      ambientEngine?.stop();
      setActiveSound("none");
    } else {
      ambientEngine?.play(type);
      setActiveSound(type);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (!isMuted) {
      ambientEngine?.setVolume(val);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      ambientEngine?.setVolume(volume);
      setIsMuted(false);
    } else {
      ambientEngine?.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="w-full bg-surface-200/70 backdrop-blur-xl border border-white/5 rounded-2xl p-3 px-4 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-warm-300 font-medium text-xs tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Kojące Tło:
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {soundOptions.map((opt) => {
          const isSelected = activeSound === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => handleSelectSound(opt.type)}
              title={opt.desc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                isSelected
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner font-medium"
                  : "bg-surface-100/60 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10"
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
            </button>
          );
        })}
      </div>

      {activeSound !== "none" && (
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
          </button>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 accent-amber-400 cursor-pointer h-1.5 bg-surface-50 rounded-lg appearance-none"
          />
        </div>
      )}
    </div>
  );
};
