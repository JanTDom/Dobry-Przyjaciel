"use client";

import React, { useState } from "react";
import { Play, Pause, Feather, Plus, Loader2 } from "lucide-react";
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
    content: `Cieszę się, że tu jesteś. Ten zbiór listów powstał po to, by przypominać Ci o Twojej sile w chwilach zwątpienia. Kiedy Twój umysł wmawia Ci, że stoisz w miejscu — pamiętaj, że każdy Twój mały krok ma znaczenie. Jestem przy Tobie i w miarę naszych rozmów będę pisać dla Ciebie nowe listy otuchy.`,
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
    <div className="flex flex-col gap-8">
      {/* Przycisk generowania nowego listu wsparcia */}
      <div className="quiet-surface rounded-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-ink/8">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-paper-dark flex items-center justify-center text-warm-amber shrink-0">
            <Feather size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-serif text-xl text-ink font-normal">
              Napisz dla mnie list na dzisiejszy wieczór
            </h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mt-0.5">
              Twój Przyjaciel stworzy osobisty list refleksyjny na podstawie tego, o czym rozmawialiście.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateEveningLetter}
          disabled={isGenerating || !profile}
          className="presence-btn-primary whitespace-nowrap px-6 py-3.5 rounded-full font-sans font-medium text-xs flex items-center gap-2 shadow-quiet-md active:scale-95 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Piszę list dla Ciebie...</span>
            </>
          ) : (
            <>
              <Plus size={14} strokeWidth={2} />
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
            className="quiet-surface rounded-surface p-7 sm:p-9 flex flex-col justify-between border-ink/8"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-ink-subtle mb-4 font-sans">
                <span>{l.date}</span>
                <span className="text-[10px] uppercase tracking-wider text-warm-amber font-semibold">
                  {l.tag}
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl text-ink font-normal mb-4 leading-snug">
                {l.title}
              </h3>

              <p className="font-serif text-base text-ink-muted leading-relaxed italic bg-paper-dark/40 p-6 rounded-card border border-ink/6 mb-6 whitespace-pre-line">
                „{l.content}”
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-ink/8">
              <button
                onClick={() => handleToggleVoice(l)}
                className="presence-btn-secondary flex items-center gap-2 text-xs font-sans px-4 py-2 rounded-full font-medium"
              >
                {playingId === l.id ? (
                  <>
                    <Pause size={13} className="animate-pulse text-warm-amber" />
                    <span>Zatrzymaj</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="text-warm-amber" />
                    <span>Odsłuchaj list</span>
                  </>
                )}
              </button>

              <span className="text-xs font-serif text-ink-muted italic">
                Zawsze przy Tobie, {profile?.companionName || "Przyjaciel"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
