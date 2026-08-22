"use client";

import React from "react";
import { Users } from "lucide-react";
import { PersonInLife } from "@/types";

interface PeopleGraphProps {
  people: PersonInLife[];
}

export const PeopleGraph: React.FC<PeopleGraphProps> = ({ people }) => {
  return (
    <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-sun-100 text-sun-600 border border-sun-200">
          <Users size={22} />
        </div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal">
            Ważne osoby w twoim życiu
          </h2>
          <p className="font-sans text-xs text-cream-600 mt-0.5">
            Mapa relacji, które kształtują twoje emocje i codzienne samopoczucie
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {people.map((p) => {
          const isSupport = p.sentiment === "supportive";
          const isStress = p.sentiment === "stressful";

          return (
            <div
              key={p.id}
              className="bg-cream-50/70 border border-cream-300 p-5 rounded-2xl flex flex-col justify-between hover:border-sun-300 shadow-warm-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg text-cream-950 font-medium">
                      {p.name}
                    </h3>
                    <span className="text-xs text-cream-600 font-sans">
                      {p.relation}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-sans font-medium px-2.5 py-1 rounded-full border ${
                      isSupport
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : isStress
                        ? "bg-rose-50 text-rose-800 border-rose-300"
                        : "bg-cream-200 text-cream-800 border-cream-300"
                    }`}
                  >
                    {isSupport ? "Wsparcie" : isStress ? "Wymaga granic" : "Złożona"}
                  </span>
                </div>

                <p className="font-sans text-xs text-cream-800 leading-relaxed mb-4">
                  {p.notes}
                </p>
              </div>

              <div className="text-[11px] text-cream-500 font-sans border-t border-cream-200 pt-2">
                Ostatnio wspomniane: {p.lastMentioned}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
