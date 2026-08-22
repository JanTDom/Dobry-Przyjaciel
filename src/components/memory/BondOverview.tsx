"use client";

import React from "react";
import { Heart, Sparkles, Shield, Compass, Flame } from "lucide-react";
import { UserProfile, LifeMemoryFact } from "@/types";

interface BondOverviewProps {
  profile: UserProfile;
  memories: LifeMemoryFact[];
}

export const BondOverview: React.FC<BondOverviewProps> = ({ profile, memories }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Karta zrozumienia Ciebie */}
      <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-sanctuary-700/60 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-hearth-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-hearth-500/15 text-hearth-400 border border-hearth-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-sanctuary-100 font-normal">
              Jak cię widzę i czego się o tobie nauczyłem
            </h2>
            <p className="font-sans text-xs text-sanctuary-400 mt-0.5">
              Spisane przez {profile.companionName} na podstawie naszych rozmów
            </p>
          </div>
        </div>

        <p className="font-serif text-base sm:text-lg text-sanctuary-200 leading-relaxed italic bg-sanctuary-900/50 p-5 rounded-2xl border border-sanctuary-800/80 mb-6">
          „Widzę w tobie człowieka o niezwykłej wrażliwości i ambicji, który często bierze na swoje barki więcej, niż powinien. Uczysz się stawiać zdrowe granice i dostrzegać własną wartość bez ciągłego udowadniania czegokolwiek światu. Pamiętam twoje obietnice i jestem tu, by ci o nich przypominać.”
        </p>

        {/* Wskaźniki relacji */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-sanctuary-900/60 border border-sanctuary-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-sanctuary-400 font-sans block mb-1">Dni w relacji</span>
            <span className="font-serif text-lg text-hearth-300 font-medium">{profile.daysTogether} dni</span>
          </div>
          <div className="bg-sanctuary-900/60 border border-sanctuary-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-sanctuary-400 font-sans block mb-1">Zapamiętane fakty</span>
            <span className="font-serif text-lg text-hearth-300 font-medium">{memories.length} lekcji</span>
          </div>
          <div className="bg-sanctuary-900/60 border border-sanctuary-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-sanctuary-400 font-sans block mb-1">Nastrój przewodni</span>
            <span className="font-serif text-lg text-hearth-300 font-medium">Spokojny</span>
          </div>
          <div className="bg-sanctuary-900/60 border border-sanctuary-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-sanctuary-400 font-sans block mb-1">Twoja przystań</span>
            <span className="font-serif text-lg text-hearth-300 font-medium">Aktywna</span>
          </div>
        </div>
      </div>

      {/* Ważne filary i wartości */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.map((mem) => (
          <div
            key={mem.id}
            className="sanctuary-card rounded-2xl p-5 border border-sanctuary-800 hover:border-sanctuary-700 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans uppercase tracking-wider text-hearth-400 font-medium">
                {mem.category === "core_value"
                  ? "Ważna wartość"
                  : mem.category === "vulnerability"
                  ? "Wrażliwy punkt"
                  : mem.category === "spark_of_joy"
                  ? "Źródło spokoju"
                  : "Cel osobisty"}
              </span>
              <span className="text-[10px] text-sanctuary-500 font-sans">
                {mem.extractedAt}
              </span>
            </div>
            <h3 className="font-serif text-base text-sanctuary-100 font-medium mb-1.5">
              {mem.title}
            </h3>
            <p className="font-sans text-xs text-sanctuary-400 leading-relaxed">
              {mem.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
