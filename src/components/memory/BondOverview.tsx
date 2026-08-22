"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { UserProfile, LifeMemoryFact } from "@/types";

interface BondOverviewProps {
  profile: UserProfile;
  memories: LifeMemoryFact[];
}

export const BondOverview: React.FC<BondOverviewProps> = ({ profile, memories }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Karta zrozumienia Ciebie */}
      <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-sun-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-sun-100 text-sun-600 border border-sun-200">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal">
              Jak cię widzę i czego się o tobie nauczyłem
            </h2>
            <p className="font-sans text-xs text-cream-600 mt-0.5">
              Spisane przez {profile.companionName} na podstawie naszych rozmów
            </p>
          </div>
        </div>

        <p className="font-serif text-base sm:text-xl text-cream-900 leading-relaxed italic bg-cream-50/80 p-6 rounded-2xl border border-cream-200 mb-6 shadow-inner">
          „Widzę w tobie człowieka o niezwykłej wrażliwości i ambicji, który często bierze na swoje barki więcej, niż powinien. Uczysz się stawiać zdrowe granice i dostrzegać własną wartość bez ciągłego udowadniania czegokolwiek światu. Pamiętam twoje obietnice i jestem tu, by ci o nich przypominać.”
        </p>

        {/* Wskaźniki relacji */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-cream-300 p-4 rounded-2xl shadow-warm-sm">
            <span className="text-[11px] text-cream-600 font-sans block mb-1 font-medium">Dni w relacji</span>
            <span className="font-serif text-xl text-sun-700 font-semibold">{profile.daysTogether} dni</span>
          </div>
          <div className="bg-white border border-cream-300 p-4 rounded-2xl shadow-warm-sm">
            <span className="text-[11px] text-cream-600 font-sans block mb-1 font-medium">Zapamiętane fakty</span>
            <span className="font-serif text-xl text-sun-700 font-semibold">{memories.length} lekcji</span>
          </div>
          <div className="bg-white border border-cream-300 p-4 rounded-2xl shadow-warm-sm">
            <span className="text-[11px] text-cream-600 font-sans block mb-1 font-medium">Nastrój przewodni</span>
            <span className="font-serif text-xl text-sun-700 font-semibold">Spokojny</span>
          </div>
          <div className="bg-white border border-cream-300 p-4 rounded-2xl shadow-warm-sm">
            <span className="text-[11px] text-cream-600 font-sans block mb-1 font-medium">Twoja przystań</span>
            <span className="font-serif text-xl text-sun-700 font-semibold">Aktywna</span>
          </div>
        </div>
      </div>

      {/* Ważne filary i wartości */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.map((mem) => (
          <div
            key={mem.id}
            className="sanctuary-card rounded-2xl p-5 border border-cream-300 hover:border-sun-300 shadow-warm-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans uppercase tracking-wider text-sun-700 font-semibold">
                {mem.category === "core_value"
                  ? "Ważna wartość"
                  : mem.category === "vulnerability"
                  ? "Wrażliwy punkt"
                  : mem.category === "spark_of_joy"
                  ? "Źródło spokoju"
                  : "Cel osobisty"}
              </span>
              <span className="text-[11px] text-cream-500 font-sans">
                {mem.extractedAt}
              </span>
            </div>
            <h3 className="font-serif text-base text-cream-950 font-medium mb-1.5">
              {mem.title}
            </h3>
            <p className="font-sans text-xs text-cream-700 leading-relaxed">
              {mem.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
