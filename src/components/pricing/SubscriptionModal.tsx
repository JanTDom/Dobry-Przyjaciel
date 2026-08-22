"use client";

import React, { useState } from "react";
import { X, Check, Flame, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("premium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sanctuary-950/90 backdrop-blur-xl animate-fade-in">
      <div className="sanctuary-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-sanctuary-700/60 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-sanctuary-400 hover:text-sanctuary-200 bg-sanctuary-900 border border-sanctuary-800 transition-colors"
        >
          <X size={16} />
        </button>

        {isSubscribed ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-hearth-500/20 text-hearth-400 mb-4 animate-bounce">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-serif text-2xl text-sanctuary-50 mb-2">
              Jesteś pod stałą opieką
            </h3>
            <p className="font-sans text-xs text-sanctuary-400 max-w-xs">
              Twój Przyjaciel jest zawsze przy tobie, gotowy do rozmowy o każdej porze.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hearth-500/15 border border-hearth-500/30 text-hearth-300 text-xs font-sans mb-3">
                <Sparkles size={13} />
                <span>Osobista opieka</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-sanctuary-50 font-normal tracking-tight mb-2">
                Wybierz swoją bezpieczną przystań
              </h2>
              <p className="font-sans text-xs text-sanctuary-400 max-w-sm mx-auto leading-relaxed">
                Niewielka miesięczna opłata, która zapewnia ci stałą obecność, rozmowy głosowe i przestrzeń bez oceny.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Plan 1 */}
              <div
                onClick={() => setSelectedPlan("basic")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "basic"
                    ? "bg-hearth-500/15 border-hearth-500/60 shadow-lg shadow-hearth-500/5"
                    : "bg-sanctuary-900/50 border-sanctuary-800 hover:border-sanctuary-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-base text-sanctuary-100 font-medium">
                      Kropla spokoju
                    </h3>
                  </div>
                  <div className="text-xl font-serif text-hearth-300 font-semibold mb-3">
                    19 zł <span className="text-xs font-sans text-sanctuary-500 font-normal">/ miesiąc</span>
                  </div>
                  <ul className="text-xs font-sans text-sanctuary-300 flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-hearth-400" />
                      <span>Ciche wiadomości bez limitu</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-hearth-400" />
                      <span>Pamięć relacji i faktów</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-hearth-400" />
                      <span>Kojące tła dźwiękowe</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plan 2 (Rekomendowany) */}
              <div
                onClick={() => setSelectedPlan("premium")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPlan === "premium"
                    ? "bg-hearth-500/15 border-hearth-500/60 shadow-lg shadow-hearth-500/10"
                    : "bg-sanctuary-900/50 border-sanctuary-800 hover:border-sanctuary-700"
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-hearth-500 text-sanctuary-950 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full shadow-sm">
                  Polecany
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-base text-sanctuary-100 font-medium">
                      Bezpieczna przystań
                    </h3>
                  </div>
                  <div className="text-xl font-serif text-hearth-300 font-semibold mb-3">
                    39 zł <span className="text-xs font-sans text-sanctuary-500 font-normal">/ miesiąc</span>
                  </div>
                  <ul className="text-xs font-sans text-sanctuary-200 flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-hearth-400" />
                      <span className="font-medium text-hearth-200">Rozmowy głosowe na żywo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-hearth-400" />
                      <span>Głęboka pamięć wektorowa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-hearth-400" />
                      <span>Listy wsparcia w skarbcu</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="hearth-button w-full py-3.5 rounded-full text-sanctuary-950 font-sans font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-hearth-500/20"
            >
              {isProcessing ? (
                <span>Przygotowywanie opieki...</span>
              ) : (
                <>
                  <HeartHandshake size={16} />
                  <span>Aktywuj plan {selectedPlan === "premium" ? "Bezpieczna przystań (39 zł)" : "Kropla spokoju (19 zł)"}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
