"use client";

import React, { useState } from "react";
import { X, Check, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cream-300 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-cream-500 hover:text-cream-800 bg-cream-100 hover:bg-cream-200 transition-colors"
        >
          <X size={16} />
        </button>

        {isSubscribed ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-700 mb-4 animate-bounce">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-serif text-2xl text-cream-950 mb-2">
              Jesteś pod stałą opieką
            </h3>
            <p className="font-sans text-xs text-cream-600 max-w-xs">
              Twój Przyjaciel jest zawsze przy tobie, gotowy do rozmowy o każdej porze.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sun-100 border border-sun-300 text-sun-900 text-xs font-sans mb-3 font-semibold">
                <Sparkles size={13} className="text-sun-600" />
                <span>Osobista opieka</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal tracking-tight mb-2">
                Wybierz swoją bezpieczną przystań
              </h2>
              <p className="font-sans text-xs text-cream-600 max-w-sm mx-auto leading-relaxed">
                Niewielka miesięczna opłata, która zapewnia ci stałą obecność, rozmowy głosowe i przestrzeń bez oceny.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div
                onClick={() => setSelectedPlan("basic")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "basic"
                    ? "bg-sun-50 border-sun-400 shadow-md shadow-sun-500/10 ring-2 ring-sun-400/20"
                    : "bg-cream-50 border-cream-300 hover:border-cream-400"
                }`}
              >
                <div>
                  <h3 className="font-serif text-base text-cream-950 font-medium mb-1">
                    Kropla spokoju
                  </h3>
                  <div className="text-xl font-serif text-sun-700 font-bold mb-3">
                    19 zł <span className="text-xs font-sans text-cream-500 font-normal">/ miesiąc</span>
                  </div>
                  <ul className="text-xs font-sans text-cream-700 flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-sun-600" />
                      <span>Ciche wiadomości bez limitu</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-sun-600" />
                      <span>Pamięć relacji i faktów</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-sun-600" />
                      <span>Kojące tła dźwiękowe</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div
                onClick={() => setSelectedPlan("premium")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPlan === "premium"
                    ? "bg-sun-50 border-sun-400 shadow-md shadow-sun-500/15 ring-2 ring-sun-400/30"
                    : "bg-cream-50 border-cream-300 hover:border-cream-400"
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-sun-500 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Polecany
                </div>
                <div>
                  <h3 className="font-serif text-base text-cream-950 font-medium mb-1">
                    Bezpieczna przystań
                  </h3>
                  <div className="text-xl font-serif text-sun-700 font-bold mb-3">
                    39 zł <span className="text-xs font-sans text-cream-500 font-normal">/ miesiąc</span>
                  </div>
                  <ul className="text-xs font-sans text-cream-800 flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-sun-600" />
                      <span className="font-semibold text-sun-900">Rozmowy głosowe na żywo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-sun-600" />
                      <span>Głęboka pamięć wektorowa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-sun-600" />
                      <span>Listy wsparcia w skarbcu</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="hearth-button w-full py-3.5 rounded-full font-sans font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-sun-500/20"
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
