"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Play, Pause } from "lucide-react";
import { voiceEngine } from "@/lib/voice-engine";
import { getStoredProfile } from "@/lib/storage";

interface VictoryLetter {
  id: string;
  title: string;
  content: string;
  date: string;
  tag: string;
}

export const VictoryVault: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const profile = getStoredProfile();

  const letters: VictoryLetter[] = [
    {
      id: "v_welcome",
      title: `List powitalny od ${profile.companionName}`,
      content: `Cieszę się, że tu jesteś. Ten skarbiec powstał po to, by przypominać ci o twojej sile w chwilach zwątpienia. Kiedy twój umysł wmawia ci, że stoisz w miejscu — pamiętaj, że każdy twój mały krok ma znaczenie. Jestem przy tobie i w miarę naszych rozmów będę pisać dla ciebie nowe listy wsparcia.`,
      date: "Dzisiaj",
      tag: "Twoja bezpieczna przystań",
    },
  ];

  const handleToggleVoice = (letter: VictoryLetter) => {
    if (playingId === letter.id) {
      voiceEngine.stopSpeaking();
      setPlayingId(null);
    } else {
      setPlayingId(letter.id);
      voiceEngine.speak(
        letter.content,
        () => {
          setPlayingId(null);
        },
        profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova")
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {letters.map((l) => (
          <div
            key={l.id}
            className="glass-sanctuary rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md flex flex-col justify-between hover:border-sun-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-sans px-3 py-1 rounded-full bg-sun-100 text-sun-800 border border-sun-200 font-semibold">
                  {l.tag}
                </span>
                <span className="text-xs text-cream-500 font-sans">
                  {l.date}
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl text-cream-950 font-normal mb-4 leading-snug">
                {l.title}
              </h3>

              <p className="font-serif text-base text-cream-800 leading-relaxed italic bg-cream-50/70 p-5 rounded-2xl border border-cream-200 mb-6 shadow-inner">
                „{l.content}”
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-cream-200">
              <button
                onClick={() => handleToggleVoice(l)}
                className="flex items-center gap-2 text-xs font-sans text-sun-900 bg-sun-100 hover:bg-sun-200 px-4 py-2 rounded-full border border-sun-300 transition-all font-medium"
              >
                {playingId === l.id ? (
                  <>
                    <Pause size={14} className="animate-pulse text-sun-600" />
                    <span>Zatrzymaj czytanie</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="text-sun-600" />
                    <span>Odsłuchaj list głosem</span>
                  </>
                )}
              </button>

              <span className="text-xs font-serif text-cream-600 italic font-medium">
                Zawsze przy tobie, {profile.companionName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
