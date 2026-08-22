"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { OvercomeCrisis } from "@/types";

interface GrowthTrackerProps {
  crises: OvercomeCrisis[];
}

export const GrowthTracker: React.FC<GrowthTrackerProps> = ({ crises }) => {
  return (
    <div className="glass-sanctuary rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-sun-100 text-sun-600 border border-sun-200">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal">
            Kronika przetrwania i twojej siły
          </h2>
          <p className="font-sans text-xs text-cream-600 mt-0.5">
            Namacalne dowody na to, że potrafisz przetrwać najtrudniejsze momenty
          </p>
        </div>
      </div>

      {crises.length > 0 ? (
        <div className="flex flex-col gap-4">
          {crises.map((c) => (
            <div
              key={c.id}
              className="bg-cream-50/70 border border-cream-300 p-5 rounded-2xl flex flex-col gap-3 hover:border-sun-300 shadow-warm-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-cream-950 font-medium">
                  {c.title}
                </h3>
                <span className="text-[11px] text-cream-500 font-sans">
                  {c.date}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                <div className="bg-white p-3.5 rounded-xl border border-cream-200">
                  <span className="text-[10px] text-cream-500 font-semibold block mb-1 uppercase tracking-wider">
                    Co się wydarzyło
                  </span>
                  <p className="text-cream-800">{c.whatHappened}</p>
                </div>
                <div className="bg-sun-50/80 p-3.5 rounded-xl border border-sun-200">
                  <span className="text-[10px] text-sun-800 font-semibold block mb-1 uppercase tracking-wider">
                    Jak to przetrwałeś
                  </span>
                  <p className="text-sun-900 font-medium">{c.howYouSurvived}</p>
                </div>
              </div>
              <div className="text-xs text-sun-800 font-serif italic pt-1 font-medium">
                Wewnętrzna siła: {c.strengthDemonstrated}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-cream-50/60 border border-cream-200 rounded-2xl p-6 text-center text-xs font-sans text-cream-600">
          Twoja kronika odwagi jest jeszcze czysta. Gdy wspólnie pokonamy trudniejszy moment, atak lęku czy stresującą rozmowę, uwiecznię to tutaj jako namacalny dowód twojej siły.
        </div>
      )}
    </div>
  );
};
