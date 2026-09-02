"use client";

import React, { useState } from "react";
import { X, Check, Volume2, Play, Pause } from "lucide-react";
import { UserProfile } from "@/types";
import { voiceEngine } from "@/lib/voice-engine";

interface CompanionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const CompanionSettingsModal: React.FC<CompanionSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [userName, setUserName] = useState(profile.name || "Janek");
  const [companionName, setCompanionName] = useState(profile.companionName || "Agata");
  const [companionGender, setCompanionGender] = useState<"female" | "male" | "neutral">(
    profile.companionGender || "female"
  );
  const [companionVoice, setCompanionVoice] = useState<string>(
    profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova")
  );
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  // Synchronizacja przy każdorazowym otwarciu modalu
  React.useEffect(() => {
    if (isOpen && profile) {
      setUserName(profile.name || "Janek");
      setCompanionName(profile.companionName || (profile.companionGender === "male" ? "Maciej" : "Agata"));
      setCompanionGender(profile.companionGender || "female");
      setCompanionVoice(profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova"));
    }
  }, [isOpen, profile]);

  // Zamknięcie klawiszem Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        voiceEngine.stopSpeaking();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const femaleSuggestions = ["Agata", "Łucja", "Zofia", "Ania", "Maja", "Hania"];
  const maleSuggestions = ["Maciej", "Janek", "Michał", "Adam", "Piotr", "Miron"];

  const handleGenderChange = (gender: "female" | "male") => {
    setCompanionGender(gender);
    if (gender === "male") {
      setCompanionVoice("echo");
    } else {
      setCompanionVoice("nova");
    }
  };

  const handlePlaySample = () => {
    if (isPlayingSample) {
      voiceEngine.stopSpeaking();
      setIsPlayingSample(false);
    } else {
      setIsPlayingVoiceSample(true);
    }
  };

  const setIsPlayingVoiceSample = (state: boolean) => {
    setIsPlayingSample(state);
    if (state) {
      const greeting = `Cześć ${userName}. Jestem ${companionName || "Twoim Przyjacielem"}. Cieszę się, że rozmawiamy — zawsze możesz na mnie liczyć.`;
      voiceEngine.speak(
        greeting,
        () => {
          setIsPlayingSample(false);
        },
        companionVoice,
        true
      );
    }
  };

  const handleSave = () => {
    voiceEngine.stopSpeaking();
    const updated: UserProfile = {
      ...profile,
      name: userName.trim() || "Przyjaciel",
      companionName: companionName.trim() || "Przyjaciel",
      companionGender,
      companionVoice,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/60 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-paper-surface rounded-surface p-6 sm:p-10 max-w-md w-full border border-ink/10 shadow-quiet-lg relative max-h-[90vh] overflow-y-auto">
        {/* Przycisk zamknięcia */}
        <button
          type="button"
          onClick={() => {
            voiceEngine.stopSpeaking();
            onClose();
          }}
          aria-label="Zamknij okno personalizacji"
          className="absolute top-5 right-5 w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-ink-muted hover:text-ink bg-paper-dark/60 hover:bg-paper-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
        >
          <X size={16} />
        </button>

        {/* Nagłówek modalu */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-2">
            Personalizacja relacji
          </span>
          <h2 id="settings-modal-title" className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
            Twój Przyjaciel
          </h2>
          <p className="font-sans text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
            Wybierz brzmienie głosu i nadaj swojemu Przyjacielowi własne, wybrane imię.
          </p>
        </div>

        {/* 1. Wybór tembru głosu */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-ink font-sans mb-2">
            Tembr głosu
          </label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Wybór tembru głosu">
            <button
              type="button"
              role="radio"
              aria-checked={companionGender === "female"}
              onClick={() => handleGenderChange("female")}
              className={`p-4 rounded-card border text-left flex flex-col justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
                companionGender === "female"
                  ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                  : "bg-paper border-ink/10 hover:border-ink/20"
              }`}
            >
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-warm-amber font-semibold block mb-1">
                  Tembr żeński
                </span>
                <span className="font-serif text-base text-ink font-normal block mb-0.5">
                  Ciepły i kojący
                </span>
                <p className="text-[11px] text-ink-muted font-sans leading-relaxed">
                  Bliski, łagodny ton
                </p>
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={companionGender === "male"}
              onClick={() => handleGenderChange("male")}
              className={`p-4 rounded-card border text-left flex flex-col justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
                companionGender === "male"
                  ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                  : "bg-paper border-ink/10 hover:border-ink/20"
              }`}
            >
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-warm-amber font-semibold block mb-1">
                  Tembr męski
                </span>
                <span className="font-serif text-base text-ink font-normal block mb-0.5">
                  Głęboki i spokojny
                </span>
                <p className="text-[11px] text-ink-muted font-sans leading-relaxed">
                  Wyważony, uziemiający
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Imię przyjaciela */}
        <div className="mb-5">
          <label htmlFor="companion-name-input" className="block text-xs font-medium text-ink font-sans mb-1.5">
            Imię Twojego Przyjaciela
          </label>
          <input
            id="companion-name-input"
            type="text"
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder="Imię Przyjaciela..."
            className="w-full bg-paper border border-ink/15 rounded-card px-4 py-2.5 text-base sm:text-sm font-sans text-ink focus:outline-none focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30"
          />

          {/* Szybkie propozycje imion */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-ink-subtle font-sans mr-1">Propozycje:</span>
            {(companionGender === "female" ? femaleSuggestions : maleSuggestions).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCompanionName(name)}
                className={`text-[11px] font-sans px-3 py-1.5 min-h-[36px] rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-warm-amber/60 ${
                  companionName === name
                    ? "bg-paper-dark text-ink border-warm-amber font-medium"
                    : "bg-paper text-ink-muted border-ink/10 hover:border-ink/20"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Twoje imię */}
        <div className="mb-6">
          <label htmlFor="user-name-input" className="block text-xs font-medium text-ink font-sans mb-1.5">
            Twoje imię
          </label>
          <input
            id="user-name-input"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Twoje imię..."
            className="w-full bg-paper border border-ink/15 rounded-card px-4 py-2.5 text-base sm:text-sm font-sans text-ink focus:outline-none focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30"
          />
        </div>

        {/* Próbka głosu i zapis */}
        <div className="flex flex-col gap-3 pt-3 border-t border-ink/8">
          <button
            type="button"
            onClick={handlePlaySample}
            aria-label={isPlayingSample ? "Zatrzymaj odsłuchiwanie próbki" : `Posłuchaj próbki głosu (${companionName})`}
            className="presence-btn-secondary w-full py-3 min-h-[44px] rounded-full font-sans font-medium text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
          >
            {isPlayingSample ? <Pause size={14} className="text-warm-amber" /> : <Volume2 size={14} className="text-warm-amber" />}
            <span>{isPlayingSample ? "Zatrzymaj próbkę" : `Posłuchaj próbki głosu (${companionName})`}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            aria-label="Zapisz ustawienia relacji"
            className="presence-btn-primary w-full py-3.5 min-h-[44px] rounded-full font-sans font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-quiet-md active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
          >
            <Check size={15} />
            <span>Zapisz ustawienia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
