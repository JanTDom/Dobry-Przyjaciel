"use client";

import React from "react";
import { OvercomeCrisis } from "@/types";
import { ShieldCheck, Calendar, Zap } from "lucide-react";

interface GrowthTrackerProps {
  crises: OvercomeCrisis[];
}

export const GrowthTracker: React.FC<GrowthTrackerProps> = ({ crises }) => {
  return (
    <div className="w-full bg-surface-200/90 border border-white/10 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Kronika Przetrwania (Dowody Siły)</h3>
        </div>
        <span className="text-xs text-slate-400">Fakty, gdy wątpisz w siebie</span>
      </div>

      <div className="space-y-3.5">
        {crises.map((item) => (
          <div
            key={item.id}
            className="bg-surface-100/90 border border-white/5 rounded-2xl p-4.5 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm sm:text-base font-semibold text-white">{item.title}</h4>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                {item.date}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-500 font-medium mr-1.5">Co się działo:</span>
                {item.whatHappened}
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500 font-medium mr-1.5">Jak to przetrwałeś:</span>
                {item.howYouSurvived}
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 flex items-center gap-2 mt-2">
                <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-medium">{item.strengthDemonstrated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
