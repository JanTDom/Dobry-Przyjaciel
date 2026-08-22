"use client";

import React, { useState } from "react";
import { Flame, CloudRain, Waves, Sparkles, Trees, Volume2, VolumeX } from "lucide-react";
import { soundscapeEngine, SoundscapeType } from "@/lib/audio-synthesizer";

export const AmbientSoundscape: React.FC = () => {
  const [active, setActive] = useState<SoundscapeType | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);

  const soundscapes: { type: SoundscapeType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: "fireplace",
      label: "Ciepły kominek",
      icon: <Flame size={16} strokeWidth={1.75} className="text-warm-amber" />,
      desc: "Kojący trzask drewna",
    },
    {
      type: "rain",
      label: "Spokojny deszcz",
      icon: <CloudRain size={16} strokeWidth={1.75} className="text-warm-dusk" />,
      desc: "Miękki szum za oknem",
    },
    {
      type: "ocean",
      label: "Fale oceanu",
      icon: <Waves size={16} strokeWidth={1.75} className="text-warm-sage" />,
      desc: "Miarowy oddech wody",
    },
    {
      type: "alpha_waves",
      label: "Fale alfa 8Hz",
      icon: <Sparkles size={16} strokeWidth={1.75} className="text-warm-amber" />,
      desc: "Dźwięk wyciszający myśli",
    },
    {
      type: "forest",
      label: "Nocny las",
      icon: <Trees size={16} strokeWidth={1.75} className="text-warm-sage" />,
      desc: "Cichy szum drzew nocą",
    },
  ];

  const handleSelect = (type: SoundscapeType) => {
    if (active === type) {
      soundscapeEngine.stop();
      setActive(null);
    } else {
      soundscapeEngine.play(type);
      soundscapeEngine.setVolume(volume);
      setActive(type);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundscapeEngine.setVolume(val);
  };

  const handleToggleMute = () => {
    const muted = soundscapeEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="quiet-surface rounded-surface p-5 sm:p-6 border border-ink/8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-medium text-ink font-sans">Kojące tło dźwiękowe</h3>
          <p className="text-[11px] text-ink-muted font-sans">Dźwięki otoczenia w tle rozmowy</p>
        </div>

        {/* Sterowanie głośnością */}
        {active && (
          <div className="flex items-center gap-2 bg-paper-dark/60 px-3 py-1.5 rounded-full border border-ink/8">
            <button
              onClick={handleToggleMute}
              className="text-ink-muted hover:text-ink transition-colors"
              title={isMuted ? "Włącz dźwięk" : "Wycisz"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-ink/15 rounded-lg appearance-none cursor-pointer accent-warm-amber"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {soundscapes.map((s) => {
          const isSelected = active === s.type;
          return (
            <button
              key={s.type}
              onClick={() => handleSelect(s.type)}
              className={`flex flex-col text-left p-3 rounded-card transition-all border ${
                isSelected
                  ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                  : "bg-paper hover:bg-paper-dark border-ink/8 hover:border-ink/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1.5 rounded-lg ${isSelected ? "bg-paper-dark" : "bg-paper-dark/60"}`}>
                  {s.icon}
                </div>
                <span className={`text-xs font-medium font-sans ${isSelected ? "text-ink" : "text-ink-muted"}`}>
                  {s.label}
                </span>
              </div>
              <span className="text-[10px] text-ink-subtle font-sans line-clamp-1">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
