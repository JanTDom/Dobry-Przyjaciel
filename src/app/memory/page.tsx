"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { CompanionSettingsModal } from "@/components/profile/CompanionSettingsModal";
import { AuthAndOnboardingModal } from "@/components/auth/AuthAndOnboardingModal";
import { getStoredProfile, saveStoredProfile, getStoredMemories, getStoredPeople, getStoredCrises, logoutUser } from "@/lib/storage";
import { UserProfile, LifeMemoryFact, PersonInLife, OvercomeCrisis } from "@/types";
import { LiveVoiceCallModal } from "@/components/conversation/LiveVoiceCallModal";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import { voiceEngine } from "@/lib/voice-engine";
import { Compass, Users, Heart, Shield, Trash2, Download, Lock, Check } from "lucide-react";

export default function MemoryPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<LifeMemoryFact[]>([]);
  const [people, setPeople] = useState<PersonInLife[]>([]);
  const [crises, setCrises] = useState<OvercomeCrisis[]>([]);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const p = getStoredProfile();
    setProfile(p);
    setMemories(getStoredMemories());
    setPeople(getStoredPeople());
    setCrises(getStoredCrises());
  }, []);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleLogout = () => {
    logoutUser();
    setProfile(null);
  };

  const handleOpenLiveCall = () => {
    if (!profile) {
      setIsAuthOpen(true);
      return;
    }
    voiceEngine.unlock();
    setIsLiveCallOpen(true);
  };

  const handleDeleteMemory = (id: string) => {
    if (!profile) return;
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    handleSaveProfile({ ...profile, memories: updated });
  };

  const handleDeletePerson = (id: string) => {
    if (!profile) return;
    const updated = people.filter((p) => p.id !== id);
    setPeople(updated);
    handleSaveProfile({ ...profile, peopleInLife: updated });
  };

  const handleDeleteCrisis = (id: string) => {
    if (!profile) return;
    const updated = crises.filter((c) => c.id !== id);
    setCrises(updated);
    handleSaveProfile({ ...profile, overcomeCrises: updated });
  };

  const handleClearAllMemory = () => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      memories: [],
      peopleInLife: [],
      overcomeCrises: [],
    };
    setMemories([]);
    setPeople([]);
    setCrises([]);
    handleSaveProfile(updated);
    setDeleteConfirm(false);
  };

  const handleExportData = () => {
    if (!profile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dobry_przyjaciel_pamiec_${profile.name || "profil"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const hasAnyMemory = memories.length > 0 || people.length > 0 || crises.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <TopNav
        onOpenLiveCall={handleOpenLiveCall}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isLoggedIn={Boolean(profile)}
        userName={profile?.name}
        companionName={profile?.companionName}
        companionGender={profile?.companionGender}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col gap-12 pb-28 md:pb-16 animate-fade-in">
        {/* Nagłówek emocjonalny */}
        <div className="max-w-2xl">
          <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-3">
            Pamięć relacji
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight leading-tight mb-3">
            To, co o Tobie pamiętam.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
            Nie musisz zaczynać każdej rozmowy od początku. Pamiętam Twoje wartości, ważne dla Ciebie osoby i momenty, w których poradziłeś sobie z trudnościami.
          </p>
        </div>

        {profile ? (
          hasAnyMemory ? (
            <div className="flex flex-col gap-12">
              {/* Sekcja: Ludzie */}
              {people.length > 0 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-ink/8 pb-2">
                    <Users size={16} strokeWidth={1.75} className="text-warm-amber" />
                    <h2 className="font-serif text-xl text-ink font-normal">
                      Ludzie w Twoim życiu
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {people.map((p) => (
                      <div
                        key={p.id}
                        className="quiet-surface rounded-card p-5 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-serif text-lg text-ink font-medium">
                                {p.name}
                              </h3>
                              <span className="text-xs text-ink-subtle font-sans">
                                {p.relation}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeletePerson(p.id)}
                              className="opacity-0 group-hover:opacity-100 text-ink-subtle hover:text-rose-600 transition-opacity p-1"
                              title="Usuń z pamięci"
                            >
                              <Trash2 size={13} strokeWidth={1.75} />
                            </button>
                          </div>
                          <p className="text-xs text-ink-muted font-sans leading-relaxed">
                            {p.notes}
                          </p>
                        </div>

                        {p.lastMentioned && (
                          <div className="text-[10px] text-ink-subtle font-sans border-t border-ink/8 pt-2 mt-3">
                            Wspomniane: {p.lastMentioned}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sekcja: Ważne dla Ciebie */}
              {memories.length > 0 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-ink/8 pb-2">
                    <Heart size={16} strokeWidth={1.75} className="text-warm-amber" />
                    <h2 className="font-serif text-xl text-ink font-normal">
                      Ważne dla Ciebie
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {memories.map((m) => (
                      <div
                        key={m.id}
                        className="quiet-surface rounded-card p-6 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-sans uppercase tracking-wider text-warm-amber font-semibold">
                              {m.category === "core_value" ? "Wartość" : m.category === "goal" ? "Cel" : "Wspomnienie"}
                            </span>
                            <button
                              onClick={() => handleDeleteMemory(m.id)}
                              className="opacity-0 group-hover:opacity-100 text-ink-subtle hover:text-rose-600 transition-opacity p-1"
                              title="Usuń z pamięci"
                            >
                              <Trash2 size={13} strokeWidth={1.75} />
                            </button>
                          </div>
                          <h3 className="font-serif text-lg text-ink font-medium mb-1.5 leading-snug">
                            {m.title}
                          </h3>
                          <p className="text-xs text-ink-muted font-sans leading-relaxed">
                            {m.detail}
                          </p>
                        </div>

                        {m.extractedAt && (
                          <div className="text-[10px] text-ink-subtle font-sans border-t border-ink/8 pt-2 mt-4">
                            Zapisano: {m.extractedAt}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sekcja: Dałeś sobie radę (Kronika odporności) */}
              {crises.length > 0 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-ink/8 pb-2">
                    <Shield size={16} strokeWidth={1.75} className="text-warm-amber" />
                    <h2 className="font-serif text-xl text-ink font-normal">
                      Przypomnij sobie, ile już przeszedłeś
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4">
                    {crises.map((c) => (
                      <div
                        key={c.id}
                        className="quiet-surface rounded-card p-6 flex flex-col gap-3 group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-lg text-ink font-medium">
                            {c.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-ink-subtle font-sans">
                              {c.date}
                            </span>
                            <button
                              onClick={() => handleDeleteCrisis(c.id)}
                              className="opacity-0 group-hover:opacity-100 text-ink-subtle hover:text-rose-600 transition-opacity p-1"
                              title="Usuń z kroniki"
                            >
                              <Trash2 size={13} strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans mt-1">
                          <div className="bg-paper-dark/50 p-3.5 rounded-xl border border-ink/6">
                            <span className="text-[10px] text-ink-subtle font-semibold block mb-1 uppercase tracking-wider">
                              Co się wydarzyło
                            </span>
                            <p className="text-ink-muted">{c.whatHappened}</p>
                          </div>
                          <div className="bg-paper-surface p-3.5 rounded-xl border border-warm-amber/20">
                            <span className="text-[10px] text-warm-amber font-semibold block mb-1 uppercase tracking-wider">
                              Jak to przetrwałeś
                            </span>
                            <p className="text-ink font-medium">{c.howYouSurvived}</p>
                          </div>
                        </div>

                        {c.strengthDemonstrated && (
                          <div className="text-xs font-serif italic text-warm-amber pt-1">
                            Wewnętrzna siła: {c.strengthDemonstrated}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sekcja Kontroli Pamięci i Prywatności */}
              <section className="quiet-surface rounded-surface p-6 sm:p-8 flex flex-col gap-4 border-ink/8 mt-4">
                <div className="flex items-center gap-2 text-ink text-xs font-sans font-medium uppercase tracking-wider">
                  <Lock size={14} strokeWidth={1.75} />
                  <span>Twoja kontrola nad pamięcią</span>
                </div>

                <p className="text-xs text-ink-muted font-sans leading-relaxed">
                  Ty masz pełną kontrolę nad tym, co Przyjaciel zapamiętuje. Możesz w każdej chwili wyeksportować kopię swoich wspomnień lub bezpowrotnie wyczyścić pamięć.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleExportData}
                    className="presence-btn-secondary flex items-center gap-2 text-xs font-sans px-4 py-2.5 rounded-full"
                  >
                    <Download size={13} strokeWidth={1.75} />
                    <span>Eksportuj moje dane (JSON)</span>
                  </button>

                  {deleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearAllMemory}
                        className="bg-rose-700 text-white text-xs font-sans px-4 py-2.5 rounded-full font-medium active:scale-95 transition-all"
                      >
                        Potwierdź usunięcie całej pamięci
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="text-xs text-ink-subtle hover:text-ink px-3 py-2"
                      >
                        Anuluj
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="text-xs text-ink-subtle hover:text-rose-700 font-sans px-3 py-2 transition-colors"
                    >
                      Wyczyść całą pamięć
                    </button>
                  )}
                </div>
              </section>
            </div>
          ) : (
            /* Emocjonalny stan pustej pamięci */
            <div className="quiet-surface rounded-surface p-10 sm:p-14 text-center max-w-lg mx-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-paper-dark flex items-center justify-center text-warm-amber mb-4">
                <Compass size={22} strokeWidth={1.75} />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
                Dopiero się poznajemy.
              </h2>

              <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed mb-8 max-w-sm">
                Z czasem pojawią się tutaj osoby, miejsca i rzeczy, które są dla Ciebie ważne. Opowiedz mi o swoim dniu podczas rozmowy.
              </p>

              <button
                onClick={handleOpenLiveCall}
                className="presence-btn-primary inline-flex items-center gap-2 text-xs font-sans px-7 py-3.5 rounded-full"
              >
                <span>Porozmawiajmy teraz</span>
              </button>
            </div>
          )
        ) : (
          /* Widok dla gościa */
          <div className="quiet-surface rounded-surface p-10 sm:p-14 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-paper-dark flex items-center justify-center text-warm-amber mb-4">
              <Compass size={22} strokeWidth={1.75} />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
              Pamięć, która daje oparcie
            </h2>

            <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed mb-8 max-w-sm">
              Stwórz relację ze swoim Przyjacielem, aby budować żywą kronikę swojego życia i nie zaczynać każdej rozmowy od początku.
            </p>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="presence-btn-primary inline-flex items-center gap-2 text-xs font-sans px-7 py-3.5 rounded-full"
            >
              <span>Spotkaj się z Przyjacielem</span>
            </button>
          </div>
        )}
      </main>

      <BottomNav />

      {profile && (
        <LiveVoiceCallModal
          isOpen={isLiveCallOpen}
          onClose={() => setIsLiveCallOpen(false)}
          profile={profile}
          onNewMessage={() => {}}
        />
      )}

      {profile && (
        <CompanionSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      <AuthAndOnboardingModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(p) => {
          setProfile(p);
          setMemories(getStoredMemories());
          setPeople(getStoredPeople());
          setCrises(getStoredCrises());
        }}
      />

      <SubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
