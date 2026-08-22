"use client";

import React, { useState } from "react";
import { X, Check, Shield } from "lucide-react";

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
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/60 backdrop-blur-md animate-fade-in">
      <div className="bg-paper-surface rounded-surface p-6 sm:p-10 max-w-lg w-full border border-ink/10 shadow-quiet-lg relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-ink-muted hover:text-ink bg-paper-dark/60 hover:bg-paper-dark transition-colors"
        >
          <X size={15} />
        </button>

        {isSubscribed ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-paper-dark flex items-center justify-center text-warm-sage mb-4">
              <Shield size={24} strokeWidth={1.75} />
            </div>
            <h3 className="font-serif text-2xl text-ink mb-2">
              Jesteś pod stałą opieką.
            </h3>
            <p className="font-sans text-xs text-ink-muted max-w-xs leading-relaxed">
              Twój Przyjaciel jest zawsze przy Tobie, gotowy do rozmowy o każdej porze.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="text-[10px] font-sans uppercase tracking-widest text-warm-amber font-semibold block mb-2">
                Osobista opieka
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-2">
                Wybierz swoją bezpieczną przystań
              </h2>
              <p className="font-sans text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                Niewielka miesięczna opłata, która zapewnia stałą obecność, rozmowy głosowe i przestrzeń bez oceny.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div
                onClick={() => setSelectedPlan("basic")}
                className={`p-4 rounded-card border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "basic"
                    ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                    : "bg-paper border-ink/10 hover:border-ink/20"
                }`}
              >
                <div>
                  <h3 className="font-serif text-base text-ink font-medium mb-1">
                    Kropla spokoju
                  </h3>
                  <div className="text-xl font-serif text-ink font-normal mb-3">
                    19 zł <span className="text-xs font-sans text-ink-muted">/ miesiąc</span>
                  </div>
                  <ul className="text-xs font-sans text-ink-muted flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <Check size={13} strokeWidth={2} className="text-warm-amber" />
                      <span>Wiadomości tekstowe bez limitu</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} strokeWidth={2} className="text-warm-amber" />
                      <span>Pamięć relacji i faktów</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} strokeWidth={2} className="text-warm-amber" />
                      <span>Kojące tła dźwiękowe</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div
                onClick={() => setSelectedPlan("premium")}
                className={`p-4 rounded-card border transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPlan === "premium"
                    ? "bg-paper-surface border-warm-amber ring-1 ring-warm-amber/30 shadow-quiet-sm"
                    : "bg-paper border-ink/10 hover:border-ink/20"
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-warm-amber text-paper-surface text-[10px] font-sans font-medium px-2 py-0.5 rounded-full shadow-quiet-sm">
                  Polecany
                </div>
                <div>
                  <h3 className="font-serif text-base text-ink font-medium mb-1">
                    Bezpieczna przystań
                  </h3>
                  <div className="text-xl font-serif text-ink font-normal mb-3">
                    39 zł <span className="text-xs font-sans text-ink-muted">/ miesiąc</span>
                  </div>
                  <ul className="text-xs font-sans text-ink flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <Check size={13} strokeWidth={2} className="text-warm-amber" />
                      <span className="font-medium text-ink">Rozmowy głosowe na żywo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} strokeWidth={2} className="text-warm-amber" />
                      <span>Głęboka pamięć relacji</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} strokeWidth={2} className="text-warm-amber" />
                      <span>Listy wsparcia w skarbcu</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="presence-btn-primary w-full py-3.5 rounded-full font-sans font-medium text-xs shadow-quiet-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? "Przetwarzanie..." : `Aktywuj plan ${selectedPlan === "premium" ? "Bezpieczna przystań (39 zł)" : "Kropla spokoju (19 zł)"}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
