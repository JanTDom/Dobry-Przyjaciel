"use client";

import React, { useState } from "react";
import { Flame, CloudRain, Waves, Sparkles, Trees, Volume2, VolumeX } from "lucide-react";
import { soundscapeEngine, SoundscapeType } from "@/lib/audio-synthesizer";

export const AmbientSoundscape: React.FC = () => {
  const [active, setActive] = useState<SoundscapeType | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);

  const soundscapes: { type: SoundscapeType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: "fireplace",
      label: "Ciepły kominek",
      icon: <Flame size={16} className="text-hearth-400" />,
      desc: "Trzaskające drewno i kojące ciepło",
    },
    {
      type: "rain",
      label: "Kojący deszcz",
      icon: <CloudRain size={16} className="text-hearth-300" />,
      desc: "Miękki szum letniego deszczu za oknem",
    },
    {
      type: "ocean",
      label: "Fale oceanu",
      icon: <Waves size={16} className="text-hearth-400" />,
      desc: "Spokojny, miarowy oddech wody",
    },
    {
      type: "alpha_waves",
      label: "Fale alfa 8Hz",
      icon: <Sparkles size={16} className="text-hearth-300" />,
      desc: "Dźwięk wyciszający gonitwę myśli",
    },
    {
      type: "forest",
      label: "Nocny las",
      icon: <Trees size={16} className="text-hearth-400" />,
      desc: "Cichy szum drzew i świerszcze pod gwiazdami",
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
    <div className="sanctuary-card rounded-2xl p-5 border border-sanctuary-700/60 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-hearth-500/10 text-hearth-400">
            <Flame size={16} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-sanctuary-100 font-sans">Kojące tło dźwiękowe</h3>
            <p className="text-xs text-sanctuary-400 font-sans">Wybierz dźwięk, który pomoże ci się wyciszyć</p>
          </div>
        </div>

        {/* Sterowanie głośnością */}
        {active && (
          <div className="flex items-center gap-2 bg-sanctuary-900/90 px-3 py-1.5 rounded-full border border-sanctuary-700/50">
            <button
              onClick={handleToggleMute}
              className="text-sanctuary-400 hover:text-hearth-300 transition-colors"
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
              className="w-16 h-1 bg-sanctuary-700 rounded-lg appearance-none cursor-pointer accent-hearth-500"
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
              className={`flex flex-col text-left p-3 rounded-xl transition-all border ${
                isSelected
                  ? "bg-hearth-500/15 border-hearth-500/50 shadow-md shadow-hearth-500/10"
                  : "bg-sanctuary-900/40 border-sanctuary-800 hover:border-sanctuary-700 hover:bg-sanctuary-850/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${isSelected ? "bg-hearth-500/20" : "bg-sanctuary-800"}`}>
                  {s.icon}
                </div>
                <span className={`text-xs font-medium font-sans ${isSelected ? "text-hearth-200" : "text-sanctuary-200"}`}>
                  {s.label}
                </span>
              </div>
              <span className="text-[11px] text-sanctuary-400 font-sans line-clamp-1">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
