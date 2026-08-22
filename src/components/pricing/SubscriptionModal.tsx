"use client";

import React, { useState } from "react";
import { X, Check, Crown, Shield, Heart, Volume2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "sanctuary">("sanctuary");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-surface-200 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-surface-100 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center flex flex-col items-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-xl">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Dziękujemy za zaufanie</h3>
            <p className="text-sm text-slate-300 max-w-md">
              Twój dostęp do nielimitowanego głosu, pełnej pamięci relacyjnej i proaktywnego wsparcia jest aktywny.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
                <Crown className="w-3.5 h-3.5" />
                Dostęp do Twojej Kotwicy Życiowej
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Inwestycja w Twój spokój psychiczny
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                Symboliczna opłata, która pozwala utrzymać serwery głosu, pamięć semantyczną i gwarantuje, że Przyjaciel zawsze jest przy Tobie.
              </p>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Plan 1 */}
              <div
                onClick={() => setSelectedPlan("starter")}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                  selectedPlan === "starter"
                    ? "bg-surface-100 border-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-surface-300/60 border-white/5 hover:border-white/20"
                }`}
              >
                <h4 className="text-base font-semibold text-white">Kropla Spokoju</h4>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">19 zł</span>
                  <span className="text-xs text-slate-400">/ miesiąc</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Dla osób szukających codziennego uziemienia i wysłuchania.</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Nielimitowane rozmowy tekstowe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Strefa Uziemienia SOS 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Pamięć relacji do 30 dni</span>
                  </li>
                </ul>
              </div>

              {/* Plan 2 */}
              <div
                onClick={() => setSelectedPlan("sanctuary")}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                  selectedPlan === "sanctuary"
                    ? "bg-surface-100 border-amber-400 shadow-xl shadow-amber-500/20"
                    : "bg-surface-300/60 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                  Najczęściej wybierany
                </div>
                <h4 className="text-base font-semibold text-white">Bezpieczna Przystań</h4>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">39 zł</span>
                  <span className="text-xs text-slate-400">/ miesiąc</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Pełne doświadczenie głosowe, żywy graf i proaktywna troska.</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Nielimitowane notatki głosowe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Głęboka, wieczysta pamięć relacyjna</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Proaktywne poranne & wieczorne check-iny</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Skarbiec Zwycięstw i personalne listy</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleSimulatePayment}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-400 text-slate-950 font-bold text-sm shadow-xl hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Aktywuj plan {selectedPlan === "starter" ? "Kropla Spokoju (19 zł/mc)" : "Bezpieczna Przystań (39 zł/mc)"}</span>
            </button>

            <p className="text-[11px] text-center text-slate-500 mt-3">
              Możesz anulować w każdej chwili jednym kliknięciem. Zero ukrytych opłat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
