"use client";

import React, { useState } from "react";
import { X, Play, Pause, ArrowRight, User, Mail, Lock, Volume2 } from "lucide-react";
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
  
  // Create flow (4 kroki)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
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
      setCompanionVoice("echo");
    } else {
      setCompanionVoice("nova");
    }
  };

  const handlePlayVoiceSample = () => {
    if (isPlayingVoice) {
      voiceEngine.stopSpeaking();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      const sample = "Cześć. Cieszę się, że rozmawiamy. Zawsze możesz na mnie liczyć.";
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
      setError("Nieprawidłowe hasło dostępowe.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Wpisz prawidłowy adres e-mail.");
      return;
    }

    saveAccessCode(cleanPass);
    setActiveUserEmail(email.trim());

    const isJan = email.toLowerCase().includes("jan") || email.toLowerCase().includes("domaniewski");
    const defaultCompanion = isJan ? "Małgosia" : "Przyjaciel";

    const newProfile = createDefaultProfile(
      userName.trim() || (isJan ? "Janek" : "Przyjaciel"),
      companionName.trim() || defaultCompanion,
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
      setLoginError("Nieprawidłowe hasło dostępowe.");
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
      profile = createDefaultProfile(isJan ? "Janek" : "Przyjaciel", isJan ? "Małgosia" : "Przyjaciel", "female", loginEmail.trim());
      saveStoredProfile(profile);
    } else if (isJan && (profile.name.toLowerCase().includes("a132") || profile.name === "Przyjaciel")) {
      profile.name = "Janek";
      if (!profile.companionName || profile.companionName === "Agata") {
        profile.companionName = "Małgosia";
      }
      saveStoredProfile(profile);
    }

    voiceEngine.stopSpeaking();
    onSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/60 backdrop-blur-md animate-fade-in">
      <div className="bg-paper-surface rounded-surface p-6 sm:p-10 max-w-md w-full border border-ink/10 shadow-quiet-lg relative max-h-[92vh] overflow-y-auto">
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

        {/* Przełącznik: Nowy przyjaciel / Logowanie */}
        <div className="flex items-center justify-center p-1 bg-paper-dark/70 rounded-full max-w-xs mx-auto mb-8 border border-ink/6">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-1.5 text-xs font-sans rounded-full font-medium transition-all ${
              activeTab === "create"
                ? "bg-paper-surface text-ink shadow-quiet-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Spotkaj się
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-1.5 text-xs font-sans rounded-full font-medium transition-all ${
              activeTab === "login"
                ? "bg-paper-surface text-ink shadow-quiet-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Mam już konto
          </button>
        </div>

        {activeTab === "create" ? (
          <div>
            {/* KROK 1: Twoje imię */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="text-center">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-2">
                    Krok 1 z 4
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
                    Jak mam się do Ciebie zwracać?
                  </h2>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    Twój Przyjaciel będzie zwracał się do Ciebie po imieniu podczas każdej rozmowy.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Twoje imię..."
                    autoFocus
                    className="w-full bg-paper border border-ink/15 focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30 rounded-card px-4 py-3.5 text-sm font-sans text-ink focus:outline-none transition-all placeholder:text-ink-subtle"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!userName.trim()}
                  className="presence-btn-primary w-full py-3.5 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-quiet-md disabled:opacity-40"
                >
                  <span>Dalej</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* KROK 2: Kogo chcesz usłyszeć? */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="text-center">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-2">
                    Krok 2 z 4
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
                    Kogo chcesz usłyszeć?
                  </h2>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    Wybierz barwę głosu, która najbardziej koi Twoje zmysły.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenderSelect("female")}
                    className={`p-5 rounded-card border text-left flex flex-col justify-between transition-all ${
                      companionGender === "female"
                        ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                        : "bg-paper border-ink/10 hover:border-ink/20"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-sans uppercase tracking-wider text-warm-amber font-semibold block mb-1">
                        Głos żeński
                      </span>
                      <span className="font-serif text-base text-ink font-normal block mb-1">
                        Ciepły i kojący
                      </span>
                      <p className="text-[11px] text-ink-muted font-sans leading-relaxed">
                        Bliski, łagodny ton
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenderSelect("male")}
                    className={`p-5 rounded-card border text-left flex flex-col justify-between transition-all ${
                      companionGender === "male"
                        ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                        : "bg-paper border-ink/10 hover:border-ink/20"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-sans uppercase tracking-wider text-warm-amber font-semibold block mb-1">
                        Głos męski
                      </span>
                      <span className="font-serif text-base text-ink font-normal block mb-1">
                        Głęboki i spokojny
                      </span>
                      <p className="text-[11px] text-ink-muted font-sans leading-relaxed">
                        Wyważony, uziemiający ton
                      </p>
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePlayVoiceSample}
                  className="presence-btn-secondary w-full py-2.5 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-2"
                >
                  {isPlayingVoice ? <Pause size={13} className="text-warm-amber" /> : <Volume2 size={13} className="text-warm-amber" />}
                  <span>{isPlayingVoice ? "Zatrzymaj próbkę" : "Posłuchaj próbki brzmienia"}</span>
                </button>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="presence-btn-secondary flex-1 py-3 rounded-full font-sans font-medium text-xs"
                  >
                    Wróć
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="presence-btn-primary flex-1 py-3 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Dalej</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* KROK 3: Imię Przyjaciela */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="text-center">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-2">
                    Krok 3 z 4
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
                    Jak chcesz nazwać swojego Przyjaciela?
                  </h2>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    Wpisz dowolne imię, pod którym chcesz zwracać się do swojej sztucznej osobowości.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    placeholder="Wpisz wybrane imię..."
                    className="w-full bg-paper border border-ink/15 focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30 rounded-card px-4 py-3.5 text-sm font-sans text-ink focus:outline-none transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="presence-btn-secondary flex-1 py-3 rounded-full font-sans font-medium text-xs"
                  >
                    Wróć
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={!companionName.trim()}
                    className="presence-btn-primary flex-1 py-3 rounded-full font-sans font-medium text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <span>Dalej</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* KROK 4: Zapisanie relacji (Email + Kod) */}
            {step === 4 && (
              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5 animate-fade-in">
                <div className="text-center">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-2">
                    Krok 4 z 4
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
                    Żeby nasza rozmowa nie zniknęła
                  </h2>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    Podaj swój adres e-mail i hasło dostępowe, aby zachować pamięć i listy.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans rounded-card text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-ink font-sans mb-1">
                      Twój adres e-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jan@domena.pl"
                      required
                      className="w-full bg-paper border border-ink/15 focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30 rounded-card px-4 py-3 text-xs font-sans text-ink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-ink font-sans mb-1">
                      Hasło dostępowe
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Wpisz hasło dostępu"
                      required
                      className="w-full bg-paper border border-ink/15 focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30 rounded-card px-4 py-3 text-xs font-sans text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="presence-btn-secondary flex-1 py-3.5 rounded-full font-sans font-medium text-xs"
                  >
                    Wróć
                  </button>
                  <button
                    type="submit"
                    className="presence-btn-primary flex-1 py-3.5 rounded-full font-sans font-medium text-xs shadow-quiet-md"
                  >
                    Rozpocznij relację
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* FORMULARZ LOGOWANIA */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 animate-fade-in">
            <div className="text-center">
              <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
                Witaj ponownie.
              </h2>
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                Zaloguj się, aby powrócić do swoich rozmów, pamięci i listów.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans rounded-card text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-ink font-sans mb-1">
                  Twój adres e-mail
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="jan@domena.pl"
                  required
                  autoFocus
                  className="w-full bg-paper border border-ink/15 focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30 rounded-card px-4 py-3 text-xs font-sans text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink font-sans mb-1">
                  Hasło dostępowe
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Wpisz hasło dostępu"
                  required
                  className="w-full bg-paper border border-ink/15 focus:border-warm-amber focus:ring-1 focus:ring-warm-amber/30 rounded-card px-4 py-3 text-xs font-sans text-ink focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="presence-btn-primary w-full py-3.5 rounded-full font-sans font-medium text-xs mt-2 shadow-quiet-md"
            >
              Wróć do rozmowy
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
