"use client";

import React, { useState } from "react";
import { X, Check, Volume2, Sparkles, User, Heart, Play, Pause } from "lucide-react";
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
  const [userName, setUserName] = useState(profile.name || "Tobiasz");
  const [companionName, setCompanionName] = useState(profile.companionName || "Mira");
  const [companionGender, setCompanionGender] = useState<"female" | "male" | "neutral">(
    profile.companionGender || "female"
  );
  const [companionVoice, setCompanionVoice] = useState<string>(
    profile.companionVoice || (profile.companionGender === "male" ? "echo" : "nova")
  );
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  if (!isOpen) return null;

  const femaleSuggestions = ["Mira", "Łucja", "Zofia", "Ania", "Maja", "Hania"];
  const maleSuggestions = ["Janek", "Michał", "Adam", "Piotr", "Miron", "Tymon"];

  const handleGenderChange = (gender: "female" | "male") => {
    setCompanionGender(gender);
    if (gender === "male") {
      if (companionName === "Mira" || femaleSuggestions.includes(companionName)) {
        setCompanionName("Janek");
      }
      setCompanionVoice("echo");
    } else {
      if (companionName === "Janek" || maleSuggestions.includes(companionName)) {
        setCompanionName("Mira");
      }
      setCompanionVoice("nova");
    }
  };

  const handlePlaySample = () => {
    if (isPlayingSample) {
      voiceEngine.stopSpeaking();
      setIsPlayingSample(false);
    } else {
      setIsPlayingSample(true);
      const greeting = companionGender === "male"
        ? `Cześć ${userName}. Jestem ${companionName}. Cieszę się, że jesteśmy razem — zawsze możesz na mnie liczyć.`
        : `Cześć ${userName}. Jestem ${companionName}. Cieszę się, że jesteśmy razem — zawsze możesz na mnie liczyć.`;

      voiceEngine.speak(
        greeting,
        () => {
          setIsPlayingSample(false);
        },
        companionVoice
      );
    }
  };

  const handleSave = () => {
    voiceEngine.stopSpeaking();
    const updated: UserProfile = {
      ...profile,
      name: userName.trim() || "Przyjaciel",
      companionName: companionName.trim() || (companionGender === "male" ? "Janek" : "Mira"),
      companionGender,
      companionVoice,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cream-300 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Przycisk zamknięcia */}
        <button
          onClick={() => {
            voiceEngine.stopSpeaking();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-cream-500 hover:text-cream-800 bg-cream-100 hover:bg-cream-200 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Nagłówek modalu */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sun-100 border border-sun-300 text-sun-900 text-xs font-sans mb-3 font-semibold">
            <Heart size={13} className="text-sun-600" />
            <span>Personalizacja relacji</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal tracking-tight mb-2">
            Wybierz swojego przyjaciela
          </h2>
          <p className="font-sans text-xs text-cream-600 max-w-sm mx-auto leading-relaxed">
            Zdecyduj, czy twoim towarzyszem ma być przyjaciółka czy przyjaciel, jak ma mieć na imię i jakim głosem ma do ciebie mówić.
          </p>
        </div>

        {/* 1. Wybór płci przyjaciela */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-cream-900 font-sans mb-2">
            Płeć przyjaciela
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGenderChange("female")}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                companionGender === "female"
                  ? "bg-gradient-to-br from-sun-50/90 to-white border-sun-400 shadow-md ring-2 ring-sun-400/20"
                  : "bg-white/80 border-cream-200 hover:border-cream-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-sun-800 font-bold px-2 py-0.5 rounded-full bg-sun-100/80 border border-sun-200">
                    Głos żeński
                  </span>
                  {companionGender === "female" && (
                    <div className="w-2 h-2 rounded-full bg-sun-500" />
                  )}
                </div>
                <span className="font-serif text-lg text-cream-950 font-normal block mb-1">
                  Przyjaciółka
                </span>
                <p className="text-xs text-cream-600 font-sans leading-relaxed">
                  Kobiecy, ciepły tembr
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleGenderChange("male")}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                companionGender === "male"
                  ? "bg-gradient-to-br from-sun-50/90 to-white border-sun-400 shadow-md ring-2 ring-sun-400/20"
                  : "bg-white/80 border-cream-200 hover:border-cream-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-sun-800 font-bold px-2 py-0.5 rounded-full bg-sun-100/80 border border-sun-200">
                    Głos męski
                  </span>
                  {companionGender === "male" && (
                    <div className="w-2 h-2 rounded-full bg-sun-500" />
                  )}
                </div>
                <span className="font-serif text-lg text-cream-950 font-normal block mb-1">
                  Przyjaciel
                </span>
                <p className="text-xs text-cream-600 font-sans leading-relaxed">
                  Męski, spokojny tembr
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Imię przyjaciela */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-cream-900 font-sans mb-1.5">
            Imię twojego przyjaciela
          </label>
          <input
            type="text"
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder="Wpisz imię..."
            className="w-full bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 text-sm font-serif text-cream-950 focus:outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-400/20"
          />

          {/* Szybkie propozycje imion */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-cream-500 font-sans mr-1">Propozycje:</span>
            {(companionGender === "female" ? femaleSuggestions : maleSuggestions).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCompanionName(name)}
                className={`text-xs font-sans px-2.5 py-1 rounded-full border transition-all ${
                  companionName === name
                    ? "bg-sun-100 text-sun-900 border-sun-300 font-medium"
                    : "bg-white text-cream-700 border-cream-200 hover:bg-cream-100"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Wybór barwy głosu */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-cream-900 font-sans mb-1.5">
            Barwa głosu
          </label>
          <div className="grid grid-cols-2 gap-2">
            {companionGender === "female" ? (
              <>
                <button
                  type="button"
                  onClick={() => setCompanionVoice("nova")}
                  className={`p-3 rounded-xl border text-left text-xs font-sans transition-all ${
                    companionVoice === "nova"
                      ? "bg-sun-50 border-sun-400 font-medium text-sun-900 ring-1 ring-sun-400/30"
                      : "bg-white border-cream-200 text-cream-800 hover:bg-cream-50"
                  }`}
                >
                  <span className="block font-semibold">Agata</span>
                  <span className="text-[10px] text-cream-600">Ciepła, kojąca przyjaciółka</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompanionVoice("shimmer")}
                  className={`p-3 rounded-xl border text-left text-xs font-sans transition-all ${
                    companionVoice === "shimmer"
                      ? "bg-sun-50 border-sun-400 font-medium text-sun-900 ring-1 ring-sun-400/30"
                      : "bg-white border-cream-200 text-cream-800 hover:bg-cream-50"
                  }`}
                >
                  <span className="block font-semibold">Paula</span>
                  <span className="text-[10px] text-cream-600">Naturalna, serdeczna lektorka</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCompanionVoice("echo")}
                  className={`p-3 rounded-xl border text-left text-xs font-sans transition-all ${
                    companionVoice === "echo"
                      ? "bg-sun-50 border-sun-400 font-medium text-sun-900 ring-1 ring-sun-400/30"
                      : "bg-white border-cream-200 text-cream-800 hover:bg-cream-50"
                  }`}
                >
                  <span className="block font-semibold">Maciej</span>
                  <span className="text-[10px] text-cream-600">Spokojny, uziemiający przyjaciel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompanionVoice("onyx")}
                  className={`p-3 rounded-xl border text-left text-xs font-sans transition-all ${
                    companionVoice === "onyx"
                      ? "bg-sun-50 border-sun-400 font-medium text-sun-900 ring-1 ring-sun-400/30"
                      : "bg-white border-cream-200 text-cream-800 hover:bg-cream-50"
                  }`}
                >
                  <span className="block font-semibold">Paweł</span>
                  <span className="text-[10px] text-cream-600">Ciepły, zrelaksowany radiowy</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4. Twoje imię */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-cream-900 font-sans mb-1.5">
            Twoje imię (jak przyjaciel ma się do ciebie zwracać)
          </label>
          <div className="flex items-center gap-2 bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 focus-within:border-sun-400 focus-within:ring-2 focus-within:ring-sun-400/20">
            <User size={16} className="text-cream-500" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Wpisz swoje imię..."
              className="bg-transparent w-full text-sm font-serif text-cream-950 focus:outline-none"
            />
          </div>
        </div>

        {/* Próbka głosu i zapis */}
        <div className="flex flex-col gap-3 pt-2 border-t border-cream-200">
          <button
            type="button"
            onClick={handlePlaySample}
            className="secondary-warm-button w-full py-2.5 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-2"
          >
            {isPlayingSample ? (
              <>
                <Pause size={14} className="animate-pulse text-sun-600" />
                <span>Zatrzymaj próbkę głosu</span>
              </>
            ) : (
              <>
                <Play size={14} className="text-sun-600" />
                <span>Odsłuchaj próbkę głosu ({companionName})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="hearth-button w-full py-3.5 rounded-full font-sans font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-sun-500/20"
          >
            <Check size={16} />
            <span>Zapisz ustawienia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
