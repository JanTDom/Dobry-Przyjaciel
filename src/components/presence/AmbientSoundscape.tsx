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
      icon: <Flame size={18} className="text-sun-500" />,
      desc: "Trzaskające drewno i kojące ciepło",
    },
    {
      type: "rain",
      label: "Kojący deszcz",
      icon: <CloudRain size={18} className="text-sky-500" />,
      desc: "Miękki szum letniego deszczu za oknem",
    },
    {
      type: "ocean",
      label: "Fale oceanu",
      icon: <Waves size={18} className="text-teal-500" />,
      desc: "Spokojny, miarowy oddech wody",
    },
    {
      type: "alpha_waves",
      label: "Fale alfa 8Hz",
      icon: <Sparkles size={18} className="text-amber-500" />,
      desc: "Dźwięk wyciszający gonitwę myśli",
    },
    {
      type: "forest",
      label: "Nocny las",
      icon: <Trees size={18} className="text-emerald-500" />,
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
    <div className="sanctuary-card rounded-3xl p-5 sm:p-6 border border-cream-300 shadow-warm-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sun-100 text-sun-600 border border-sun-200">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cream-900 font-sans">Kojące tło dźwiękowe</h3>
            <p className="text-xs text-cream-600 font-sans">Wybierz dźwięk, który pomoże ci się wyciszyć i zrelaksować</p>
          </div>
        </div>

        {/* Sterowanie głośnością */}
        {active && (
          <div className="flex items-center gap-2 bg-cream-100 px-3 py-1.5 rounded-full border border-cream-300">
            <button
              onClick={handleToggleMute}
              className="text-cream-600 hover:text-cream-900 transition-colors"
              title={isMuted ? "Włącz dźwięk" : "Wycisz"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-18 h-1.5 bg-cream-300 rounded-lg appearance-none cursor-pointer accent-sun-500"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {soundscapes.map((s) => {
          const isSelected = active === s.type;
          return (
            <button
              key={s.type}
              onClick={() => handleSelect(s.type)}
              className={`flex flex-col text-left p-3.5 rounded-2xl transition-all border ${
                isSelected
                  ? "bg-sun-50 border-sun-400 shadow-md shadow-sun-500/10 ring-2 ring-sun-400/30"
                  : "bg-white hover:bg-cream-50 border-cream-300 hover:border-cream-400 shadow-warm-sm"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`p-2 rounded-xl ${isSelected ? "bg-sun-100" : "bg-cream-100"}`}>
                  {s.icon}
                </div>
                <span className={`text-xs font-semibold font-sans ${isSelected ? "text-sun-900" : "text-cream-900"}`}>
                  {s.label}
                </span>
              </div>
              <span className="text-[11px] text-cream-600 font-sans line-clamp-1">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
