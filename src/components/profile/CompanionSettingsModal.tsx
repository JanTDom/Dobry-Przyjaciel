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

  if (!isOpen) return null;

  const femaleSuggestions = ["Agata", "Łucja", "Zofia", "Ania", "Maja", "Hania"];
  const maleSuggestions = ["Maciej", "Janek", "Michał", "Adam", "Piotr", "Miron"];

  const handleGenderChange = (gender: "female" | "male") => {
    setCompanionGender(gender);
    if (gender === "male") {
      if (companionName === "Agata" || femaleSuggestions.includes(companionName)) {
        setCompanionName("Maciej");
      }
      setCompanionVoice("echo");
    } else {
      if (companionName === "Maciej" || maleSuggestions.includes(companionName)) {
        setCompanionName("Agata");
      }
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
      const greeting = `Cześć ${userName}. Jestem ${companionName}. Cieszę się, że rozmawiamy — zawsze możesz na mnie liczyć.`;
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
      companionName: companionName.trim() || (companionGender === "male" ? "Maciej" : "Agata"),
      companionGender,
      companionVoice,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/60 backdrop-blur-md animate-fade-in">
      <div className="bg-paper-surface rounded-surface p-6 sm:p-10 max-w-md w-full border border-ink/10 shadow-quiet-lg relative max-h-[90vh] overflow-y-auto">
        {/* Przycisk zamknięcia */}
        <button
          onClick={() => {
            voiceEngine.stopSpeaking();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-ink-muted hover:text-ink bg-paper-dark/60 hover:bg-paper-dark transition-colors"
        >
          <X size={15} />
        </button>

        {/* Nagłówek modalu */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-2">
            Personalizacja relacji
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
            Twój Przyjaciel
          </h2>
          <p className="font-sans text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
            Zdecyduj, jak ma mieć na imię Twój Przyjaciel i jakim głosem ma do Ciebie mówić.
          </p>
        </div>

        {/* 1. Wybór płci przyjaciela */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-ink font-sans mb-2">
            Głos i postać
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGenderChange("female")}
              className={`p-4 rounded-card border text-left flex flex-col justify-between transition-all ${
                companionGender === "female"
                  ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                  : "bg-paper border-ink/10 hover:border-ink/20"
              }`}
            >
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-warm-amber font-semibold block mb-1">
                  Głos żeński
                </span>
                <span className="font-serif text-base text-ink font-normal block mb-0.5">
                  Agata
                </span>
                <p className="text-[11px] text-ink-muted font-sans leading-relaxed">
                  Ciepły, kojący tembr
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleGenderChange("male")}
              className={`p-4 rounded-card border text-left flex flex-col justify-between transition-all ${
                companionGender === "male"
                  ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                  : "bg-paper border-ink/10 hover:border-ink/20"
              }`}
            >
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-warm-amber font-semibold block mb-1">
                  Głos męski
                </span>
                <span className="font-serif text-base text-ink font-normal block mb-0.5">
                  Maciej
                </span>
                <p className="text-[11px] text-ink-muted font-sans leading-relaxed">
                  Spokojny, uziemiający
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Imię przyjaciela */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-ink font-sans mb-1.5">
            Imię Twojego Przyjaciela
          </label>
          <input
            type="text"
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder="Imię Przyjaciela..."
            className="w-full bg-paper border border-ink/15 rounded-card px-4 py-2.5 text-xs font-sans text-ink focus:outline-none focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30"
          />

          {/* Szybkie propozycje imion */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-ink-subtle font-sans mr-1">Propozycje:</span>
            {(companionGender === "female" ? femaleSuggestions : maleSuggestions).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCompanionName(name)}
                className={`text-[11px] font-sans px-2.5 py-0.5 rounded-full border transition-all ${
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
          <label className="block text-xs font-medium text-ink font-sans mb-1.5">
            Twoje imię
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Twoje imię..."
            className="w-full bg-paper border border-ink/15 rounded-card px-4 py-2.5 text-xs font-sans text-ink focus:outline-none focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30"
          />
        </div>

        {/* Próbka głosu i zapis */}
        <div className="flex flex-col gap-3 pt-3 border-t border-ink/8">
          <button
            type="button"
            onClick={handlePlaySample}
            className="presence-btn-secondary w-full py-2.5 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-2"
          >
            {isPlayingSample ? <Pause size={13} className="text-warm-amber" /> : <Volume2 size={13} className="text-warm-amber" />}
            <span>{isPlayingSample ? "Zatrzymaj próbkę" : `Posłuchaj próbki głosu (${companionName})`}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="presence-btn-primary w-full py-3.5 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-2 shadow-quiet-md"
          >
            <Check size={14} />
            <span>Zapisz ustawienia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
