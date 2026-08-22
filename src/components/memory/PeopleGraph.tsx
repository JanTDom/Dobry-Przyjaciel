"use client";

import React from "react";
import { Users, Heart, AlertCircle, HelpCircle } from "lucide-react";
import { PersonInLife } from "@/types";

interface PeopleGraphProps {
  people: PersonInLife[];
}

export const PeopleGraph: React.FC<PeopleGraphProps> = ({ people }) => {
  return (
    <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-sanctuary-700/60 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-hearth-500/15 text-hearth-400 border border-hearth-500/30">
          <Users size={20} />
        </div>
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-sanctuary-100 font-normal">
            Ważne osoby w twoim życiu
          </h2>
          <p className="font-sans text-xs text-sanctuary-400 mt-0.5">
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
              className="bg-sanctuary-900/60 border border-sanctuary-800 p-5 rounded-2xl flex flex-col justify-between hover:border-sanctuary-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg text-sanctuary-100 font-medium">
                      {p.name}
                    </h3>
                    <span className="text-xs text-sanctuary-400 font-sans">
                      {p.relation}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-sans px-2.5 py-1 rounded-full border ${
                      isSupport
                        ? "bg-hearth-500/15 text-hearth-300 border-hearth-500/30"
                        : isStress
                        ? "bg-rosewood-600/20 text-rosewood-400 border-rosewood-500/30"
                        : "bg-sanctuary-800 text-sanctuary-400 border-sanctuary-700"
                    }`}
                  >
                    {isSupport ? "Wsparcie" : isStress ? "Wymaga granic" : "Złożona"}
                  </span>
                </div>

                <p className="font-sans text-xs text-sanctuary-300 leading-relaxed mb-4">
                  {p.notes}
                </p>
              </div>

              <div className="text-[10px] text-sanctuary-500 font-sans border-t border-sanctuary-800/80 pt-2">
                Ostatnio wspomniane: {p.lastMentioned}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
