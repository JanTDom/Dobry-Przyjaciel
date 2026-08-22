"use client";

import React, { useState } from "react";
import { X, Sparkles, Heart, Check, Play, Pause, ArrowRight, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { saveAccessCode, VALID_ACCESS_CODES, createDefaultProfile, saveStoredProfile, getStoredProfile, setActiveUserEmail } from "@/lib/storage";
import { voiceEngine } from "@/lib/voice-engine";
import { UserProfile } from "@/types";

interface AuthAndOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export const AuthAndOnboardingModal: React.FC<AuthAndOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"create" | "login">("create");
  
  // Create form state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userName, setUserName] = useState("");
  const [companionGender, setCompanionGender] = useState<"female" | "male">("female");
  const [companionName, setCompanionName] = useState("Agata");
  const [companionVoice, setCompanionVoice] = useState("nova");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  if (!isOpen) return null;

  const handleGenderSelect = (gender: "female" | "male") => {
    setCompanionGender(gender);
    if (gender === "male") {
      setCompanionName("Maciej");
      setCompanionVoice("echo");
    } else {
      setCompanionName("Agata");
      setCompanionVoice("nova");
    }
  };

  const handlePlayVoiceSample = () => {
    if (isPlayingVoice) {
      voiceEngine.stopSpeaking();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      const sample = companionGender === "male"
        ? `Cześć ${userName || "przyjacielu"}. Jestem ${companionName}. Cieszę się, że jesteś — zawsze możesz na mnie liczyć.`
        : `Cześć ${userName || "przyjacielu"}. Jestem ${companionName}. Cieszę się, że jesteś — zawsze możesz na mnie liczyć.`;
      voiceEngine.speak(
        sample,
        () => {
          setIsPlayingVoice(false);
        },
        companionVoice,
        true
      );
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanPass = password.trim();
    if (!VALID_ACCESS_CODES.includes(cleanPass)) {
      setError("Wpisz prawidłowe hasło robocze (A132a132!).");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Wpisz prawidłowy adres e-mail.");
      return;
    }

    saveAccessCode(cleanPass);
    setActiveUserEmail(email.trim());

    const newProfile = createDefaultProfile(
      userName.trim() || "Przyjaciel",
      companionName.trim() || (companionGender === "male" ? "Maciej" : "Agata"),
      companionGender,
      email.trim()
    );
    newProfile.companionVoice = companionVoice;
    saveStoredProfile(newProfile);

    voiceEngine.stopSpeaking();
    onSuccess(newProfile);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanPass = loginPassword.trim();
    if (!VALID_ACCESS_CODES.includes(cleanPass)) {
      setLoginError("Wpisz prawidłowe hasło robocze (A132a132!).");
      return;
    }

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      setLoginError("Wpisz prawidłowy adres e-mail.");
      return;
    }

    saveAccessCode(cleanPass);
    setActiveUserEmail(loginEmail.trim());

    let profile = getStoredProfile();
    const isJan = loginEmail.toLowerCase().includes("jan") || loginEmail.toLowerCase().includes("domaniewski");
    if (!profile) {
      profile = createDefaultProfile(isJan ? "Janek" : "Przyjaciel", "Agata", "female", loginEmail.trim());
      saveStoredProfile(profile);
    } else if (isJan && (profile.name.toLowerCase().includes("a132") || profile.name === "Przyjaciel")) {
      profile.name = "Janek";
      saveStoredProfile(profile);
    }

    voiceEngine.stopSpeaking();
    onSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/45 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cream-300 shadow-2xl relative max-h-[92vh] overflow-y-auto">
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

        {/* Przełącznik: Nowy przyjaciel / Logowanie */}
        <div className="flex items-center justify-center p-1 bg-cream-100/90 rounded-2xl max-w-xs mx-auto mb-6 border border-cream-200">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 text-xs font-sans rounded-xl font-semibold transition-all ${
              activeTab === "create"
                ? "bg-white text-cream-950 shadow-warm-sm"
                : "text-cream-600 hover:text-cream-950"
            }`}
          >
            Stwórz przyjaciela
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-xs font-sans rounded-xl font-semibold transition-all ${
              activeTab === "login"
                ? "bg-white text-cream-950 shadow-warm-sm"
                : "text-cream-600 hover:text-cream-950"
            }`}
          >
            Mam już konto
          </button>
        </div>

        {activeTab === "create" ? (
          <div>
            {/* Krok 1: Twoje imię */}
            {step === 1 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-2xl bg-sun-100 text-sun-700 border border-sun-300 mb-3 shadow-sm">
                    <User size={24} />
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal tracking-tight mb-2">
                    Jak masz na imię?
                  </h2>
                  <p className="font-sans text-xs text-cream-600 max-w-xs mx-auto leading-relaxed">
                    Twój przyjaciel będzie zwracał się do ciebie po imieniu w każdej rozmowie i liście.
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Wpisz swoje imię..."
                    autoFocus
                    className="w-full bg-cream-50 border border-cream-300 focus:border-sun-400 focus:ring-2 focus:ring-sun-400/20 rounded-2xl px-4 py-3.5 text-base font-serif text-cream-950 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!userName.trim()}
                  className="hearth-button w-full py-3.5 rounded-full font-sans font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-sun-500/20 disabled:opacity-40"
                >
                  <span>Dalej: Wybierz przyjaciela</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Krok 2: Wybór przyjaciela i głosu */}
            {step === 2 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="text-center">
                  <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal tracking-tight mb-2">
                    Kto ma być twoim przyjacielem?
                  </h2>
                  <p className="font-sans text-xs text-cream-600 max-w-xs mx-auto leading-relaxed">
                    Wybierz postać i barwę głosu, która najbardziej koi twoje zmysły.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenderSelect("female")}
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
                        Agata • Ciepły, miękki tembr kojący
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenderSelect("male")}
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
                        Maciej • Spokojny, uziemiający tembr
                      </p>
                    </div>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-900 font-sans mb-1.5">
                    Imię twojego przyjaciela
                  </label>
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    placeholder="Wpisz imię..."
                    className="w-full bg-cream-50 border border-cream-300 focus:border-sun-400 focus:ring-2 focus:ring-sun-400/20 rounded-2xl px-4 py-2.5 text-sm font-serif text-cream-950 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePlayVoiceSample}
                  className="secondary-warm-button w-full py-2.5 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-2"
                >
                  {isPlayingVoice ? (
                    <>
                      <Pause size={14} className="animate-pulse text-sun-600" />
                      <span>Zatrzymaj próbkę głosu</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="text-sun-600" />
                      <span>Odsłuchaj jak brzmi {companionName}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="secondary-warm-button py-3 px-5 rounded-full text-xs font-sans font-medium"
                  >
                    Wróć
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="hearth-button flex-1 py-3.5 rounded-full font-sans font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-sun-500/20"
                  >
                    <span>Dalej: Utwórz konto</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Krok 3: E-mail i hasło robocze A132a132! */}
            {step === 3 && (
              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 animate-fade-in">
                <div className="text-center mb-1">
                  <div className="inline-flex p-3 rounded-2xl bg-sun-100 text-sun-700 border border-sun-300 mb-2 shadow-sm">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="font-serif text-2xl text-cream-950 font-normal tracking-tight mb-1">
                    Zabezpiecz swoje konto
                  </h2>
                  <p className="font-sans text-xs text-cream-600 max-w-xs mx-auto leading-relaxed">
                    Podaj e-mail, aby zachować relację z {companionName}, oraz wpisz hasło robocze.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-900 font-sans mb-1">
                    Twój adres e-mail
                  </label>
                  <div className="flex items-center gap-2 bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 focus-within:border-sun-400 focus-within:ring-2 focus-within:ring-sun-400/20">
                    <Mail size={16} className="text-cream-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="twoj@email.pl"
                      required
                      className="bg-transparent w-full text-xs sm:text-sm font-sans text-cream-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-900 font-sans mb-1">
                    Hasło robocze dostępu
                  </label>
                  <div className="flex items-center gap-2 bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 focus-within:border-sun-400 focus-within:ring-2 focus-within:ring-sun-400/20">
                    <Lock size={16} className="text-cream-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Wpisz hasło robocze..."
                      required
                      className="bg-transparent w-full text-xs sm:text-sm font-sans text-cream-950 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-cream-500 font-sans mt-1 block">
                    Wpisz hasło testowe: <strong className="text-sun-800">A132a132!</strong>
                  </span>
                </div>

                {error && (
                  <p className="text-xs text-rose-600 font-sans text-center font-medium">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="secondary-warm-button py-3 px-5 rounded-full text-xs font-sans font-medium"
                  >
                    Wróć
                  </button>
                  <button
                    type="submit"
                    className="hearth-button flex-1 py-3.5 rounded-full font-sans font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-sun-500/20"
                  >
                    <Check size={16} />
                    <span>Stwórz przyjaciela i wejdź</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Zakładka: Mam już konto */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 animate-fade-in">
            <div className="text-center mb-2">
              <div className="inline-flex p-3 rounded-2xl bg-sun-100 text-sun-700 border border-sun-300 mb-2 shadow-sm">
                <Heart size={24} />
              </div>
              <h2 className="font-serif text-2xl text-cream-950 font-normal tracking-tight mb-1">
                Wróć do swojego przyjaciela
              </h2>
              <p className="font-sans text-xs text-cream-600 max-w-xs mx-auto leading-relaxed">
                Wpisz swój e-mail, aby wczytać twoją relację, historię i wspomnienia.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-900 font-sans mb-1">
                Twój adres e-mail
              </label>
              <div className="flex items-center gap-2 bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 focus-within:border-sun-400 focus-within:ring-2 focus-within:ring-sun-400/20">
                <Mail size={16} className="text-cream-500" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="twoj@email.pl"
                  required
                  autoFocus
                  className="bg-transparent w-full text-xs sm:text-sm font-sans text-cream-950 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-900 font-sans mb-1">
                Hasło robocze dostępu
              </label>
              <div className="flex items-center gap-2 bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 focus-within:border-sun-400 focus-within:ring-2 focus-within:ring-sun-400/20">
                <Lock size={16} className="text-cream-500" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Wpisz hasło robocze..."
                  required
                  className="bg-transparent w-full text-xs sm:text-sm font-sans text-cream-950 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-cream-500 font-sans mt-1 block">
                Wpisz hasło testowe: <strong className="text-sun-800">A132a132!</strong>
              </span>
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 font-sans text-center font-medium">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="hearth-button w-full py-3.5 rounded-full font-sans font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-sun-500/20 mt-2"
            >
              <Check size={16} />
              <span>Zaloguj się do przyjaciela</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
