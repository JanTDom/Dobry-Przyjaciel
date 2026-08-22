"use client";

import React from "react";
import { ShieldCheck, Calendar, Award } from "lucide-react";
import { OvercomeCrisis } from "@/types";

interface GrowthTrackerProps {
  crises: OvercomeCrisis[];
}

export const GrowthTracker: React.FC<GrowthTrackerProps> = ({ crises }) => {
  return (
    <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-sanctuary-700/60 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-hearth-500/15 text-hearth-400 border border-hearth-500/30">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-sanctuary-100 font-normal">
            Kronika przetrwania i twojej siły
          </h2>
          <p className="font-sans text-xs text-sanctuary-400 mt-0.5">
            Namacalne dowody na to, że potrafisz przetrwać najtrudniejsze momenty
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {crises.map((c) => (
          <div
            key={c.id}
            className="bg-sanctuary-900/60 border border-sanctuary-800 p-5 rounded-2xl flex flex-col gap-3 hover:border-sanctuary-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base text-sanctuary-100 font-medium">
                {c.title}
              </h3>
              <span className="text-[11px] text-sanctuary-500 font-sans">
                {c.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
              <div className="bg-sanctuary-950/60 p-3 rounded-xl border border-sanctuary-850">
                <span className="text-[10px] text-sanctuary-400 font-medium block mb-1 uppercase tracking-wider">
                  Co się wydarzyło
                </span>
                <p className="text-sanctuary-300">{c.whatHappened}</p>
              </div>

              <div className="bg-sanctuary-950/60 p-3 rounded-xl border border-sanctuary-850">
                <span className="text-[10px] text-hearth-400 font-medium block mb-1 uppercase tracking-wider">
                  Jak to przetrwałeś
                </span>
                <p className="text-hearth-200">{c.howYouSurvived}</p>
              </div>
            </div>

            <div className="text-xs text-hearth-300/90 font-serif italic pt-1">
              ★ Udowodniona siła: {c.strengthDemonstrated}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
