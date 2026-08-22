"use client";

import React from "react";
import { PersonInLife } from "@/types";
import { Users, User, ShieldAlert, HeartHandshake, HelpCircle } from "lucide-react";

interface PeopleGraphProps {
  people: PersonInLife[];
}

export const PeopleGraph: React.FC<PeopleGraphProps> = ({ people }) => {
  const getSentimentBadge = (sentiment: PersonInLife["sentiment"]) => {
    switch (sentiment) {
      case "supportive":
        return { label: "Oparcie", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
      case "stressful":
        return { label: "Źródło presji", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
      case "complicated":
        return { label: "Złożona relacja", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
      default:
        return { label: "Neutralna", color: "bg-slate-500/15 text-slate-300 border-slate-500/30" };
    }
  };

  return (
    <div className="w-full bg-surface-200/90 border border-white/10 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Mapa Twoich Relacji</h3>
        </div>
        <span className="text-xs text-slate-400">Postacie, o których rozmawiamy</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {people.map((person) => {
          const badge = getSentimentBadge(person.sentiment);
          return (
            <div
              key={person.id}
              className="bg-surface-100/90 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-semibold text-white">{person.name}</h4>
                    <span className="text-xs text-slate-400">{person.relation}</span>
                  </div>
                  <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">{person.notes}</p>
              </div>

              <div className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
                Ostatnio wspomniany: {person.lastMentioned}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
