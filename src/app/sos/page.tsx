"use client";

import React, { useState } from "react";
import { BreathingGuide } from "@/components/sos/BreathingGuide";
import { GroundingExercise } from "@/components/sos/GroundingExercise";
import { ShieldAlert, Wind, Hand, HeartPulse, PhoneCall, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SosPage() {
  const [activeTab, setActiveTab] = useState<"breathing" | "grounding">("breathing");

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Powrót do Przyjaciela</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            Strefa Uziemienia & Pierwsza Pomoc
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Zatrzymaj lawinę myśli. Zredukuj pobudzenie układu współczulnego w kilka minut.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-100 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("breathing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "breathing"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Oddech Pudełkowy</span>
          </button>

          <button
            onClick={() => setActiveTab("grounding")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "grounding"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Uziemienie 5-4-3-2-1</span>
          </button>
        </div>
      </div>

      {/* Main Tool Area */}
      <div className="w-full">
        {activeTab === "breathing" ? <BreathingGuide /> : <GroundingExercise />}
      </div>

      {/* Emergency Helplines Box */}
      <div className="p-5 rounded-3xl bg-surface-200/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">Bezpłatne linie wsparcia kryzysowego</h4>
            <p className="text-slate-400 mt-0.5">
              Telefon Zaufania dla Dorosłych w kryzysie emocjonalnym: <strong className="text-amber-300">116 123</strong> (24/7)
            </p>
          </div>
        </div>

        <a
          href="tel:116123"
          className="px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs hover:bg-rose-400 transition-colors shrink-0 shadow-md"
        >
          Zadzwoń teraz (116 123)
        </a>
      </div>
    </div>
  );
}
