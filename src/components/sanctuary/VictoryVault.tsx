"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Play, Pause, Feather, Plus, Loader2 } from "lucide-react";
import { voiceEngine } from "@/lib/voice-engine";
import { getStoredProfile, saveStoredProfile, getStoredMessages, getStoredVictoryLetters, getStoredAccessCode } from "@/lib/storage";
import { VictoryLetter } from "@/types";

export const VictoryVault: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const profile = getStoredProfile();

  const storedLetters = getStoredVictoryLetters();
  const defaultWelcomeLetter: VictoryLetter = {
    id: "v_welcome",
    title: `List powitalny od ${profile?.companionName || "Przyjaciela"}`,
    content: `Cieszę się, że tu jesteś. Ten skarbiec powstał po to, by przypominać ci o twojej sile w chwilach zwątpienia. Kiedy twój umysł wmawia ci, że stoisz w miejscu — pamiętaj, że każdy twój mały krok ma znaczenie. Jestem przy tobie i w miarę naszych rozmów będę pisać dla ciebie nowe listy wsparcia.`,
    date: "Dzisiaj",
    tag: "Twoja bezpieczna przystań",
  };

  const letters: VictoryLetter[] = storedLetters.length > 0 ? storedLetters : [defaultWelcomeLetter];

  const handleToggleVoice = (letter: VictoryLetter) => {
    voiceEngine.unlock();
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
        profile?.companionVoice || (profile?.companionGender === "male" ? "echo" : "nova")
      );
    }
  };

  const handleGenerateEveningLetter = async () => {
    if (!profile || isGenerating) return;
    setIsGenerating(true);
    voiceEngine.unlock();

    try {
      const messages = getStoredMessages();
      const code = getStoredAccessCode() || "A132a132!";
      const res = await fetch("/api/generate-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": code,
        },
        body: JSON.stringify({
          profile,
          recentMessages: messages,
          accessCode: code,
        }),
      });

      if (res.ok) {
        const newLetterData = await res.json();
        const newLetter: VictoryLetter = {
          id: "letter_" + Date.now(),
          title: newLetterData.title,
          content: newLetterData.content,
          date: "Dzisiaj",
          tag: newLetterData.tag || "Wieczorne ukojenie",
        };

        const updatedLetters = [newLetter, ...storedLetters];
        const updatedProfile = {
          ...profile,
          victoryLetters: updatedLetters,
        };
        saveStoredProfile(updatedProfile);

        // Natychmiast odczytaj list głosem przyjaciela
        handleToggleVoice(newLetter);
      }
    } catch (err) {
      console.error("Letter generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Przycisk generowania nowego listu wsparcia */}
      <div className="glass-sanctuary rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-sun-50/70 via-cream-50/90 to-amber-50/70">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="p-3 rounded-2xl bg-sun-100 text-sun-700 border border-sun-300 shadow-sm">
            <Feather size={22} />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-cream-950 font-normal">
              Napisz dla mnie list na dzisiejszy wieczór
            </h3>
            <p className="font-sans text-xs text-cream-600">
              Twój przyjaciel stworzy osobisty list refleksyjny na podstawie tego, co dzisiaj przeżyłeś.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateEveningLetter}
          disabled={isGenerating || !profile}
          className="hearth-button whitespace-nowrap px-6 py-3.5 rounded-full font-sans font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sun-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Piszę list dla ciebie...</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Stwórz list wsparcia</span>
            </>
          )}
        </button>
      </div>

      {/* Lista listów w skarbcu */}
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

              <p className="font-serif text-base text-cream-800 leading-relaxed italic bg-cream-50/70 p-5 rounded-2xl border border-cream-200 mb-6 shadow-inner whitespace-pre-line">
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
                Zawsze przy tobie, {profile?.companionName || "Przyjaciel"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
