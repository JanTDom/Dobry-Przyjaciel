"use client";

import React, { useState } from "react";
import { UserProfile } from "@/types";
import { BookOpen, Sparkles, Heart, Plus, MailOpen } from "lucide-react";

interface VictoryVaultProps {
  profile: UserProfile;
}

export const VictoryVault: React.FC<VictoryVaultProps> = ({ profile }) => {
  const [selectedLetterId, setSelectedLetterId] = useState<string>(profile.victoryLetters[0]?.id || "");

  const activeLetter = profile.victoryLetters.find((l) => l.id === selectedLetterId) || profile.victoryLetters[0];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Letters List Column */}
      <div className="bg-surface-200/90 border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <MailOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Listy od {profile.companionName}</h3>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          Napisane specjalnie dla Ciebie na chwile, gdy opadają ręce.
        </p>

        <div className="space-y-2 overflow-y-auto max-h-[420px] custom-scrollbar pr-1">
          {profile.victoryLetters.map((letter) => {
            const isSelected = letter.id === activeLetter?.id;
            return (
              <button
                key={letter.id}
                onClick={() => setSelectedLetterId(letter.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md"
                    : "bg-surface-100 border-white/5 text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="text-[10px] uppercase font-semibold text-amber-400 mb-1">
                  {letter.tag}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold leading-snug text-white">
                  {letter.title}
                </h4>
                <span className="text-[10px] text-slate-500 mt-2 block">{letter.date}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Letter Reading Space */}
      <div className="md:col-span-2 bg-surface-200/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {activeLetter ? (
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                {activeLetter.tag}
              </span>
              <span className="text-xs text-slate-400">{activeLetter.date}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-tight">
              {activeLetter.title}
            </h2>

            <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-4 font-light italic">
              &ldquo;{activeLetter.content}&rdquo;
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">Wybierz list po lewej stronie</div>
        )}

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Zawsze w Twoim narożniku</span>
          <span className="font-semibold text-amber-300">&mdash; {profile.companionName}</span>
        </div>
      </div>
    </div>
  );
};
