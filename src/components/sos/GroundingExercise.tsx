"use client";

import React, { useState } from "react";
import { Eye, Hand, Ear, Sparkles, Coffee, Check } from "lucide-react";

export const GroundingExercise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      count: 5,
      icon: <Eye size={16} strokeWidth={1.75} className="text-warm-amber" />,
      title: "5 rzeczy, które widzisz dookoła",
      desc: "Zwróć uwagę na detale: fakturę stołu, cień na ścianie, odcień kubka.",
    },
    {
      count: 4,
      icon: <Hand size={16} strokeWidth={1.75} className="text-warm-amber" />,
      title: "4 rzeczy, które możesz dotknąć",
      desc: "Poczuj oparcie fotela pod plecami, materiał swoich ubrań, chłód blatu pod dłońmi.",
    },
    {
      count: 3,
      icon: <Ear size={16} strokeWidth={1.75} className="text-warm-amber" />,
      title: "3 dźwięki, które słyszysz",
      desc: "Wycisz się i wsłuchaj: szum wiatru, tykanie zegara, spokojny rytm własnego oddechu.",
    },
    {
      count: 2,
      icon: <Sparkles size={16} strokeWidth={1.75} className="text-warm-amber" />,
      title: "2 zapachy, które możesz wyczuć",
      desc: "Aromat herbaty, świeże powietrze z okna, zapach drewna.",
    },
    {
      count: 1,
      icon: <Coffee size={16} strokeWidth={1.75} className="text-warm-amber" />,
      title: "1 dobry smak lub myśl o wdzięczności",
      desc: "Łyk wody lub pomyśl o jednej spokojnej chwili z dzisiejszego dnia.",
    },
  ];

  return (
    <div className="quiet-surface rounded-surface p-6 sm:p-8 flex flex-col gap-6 max-w-lg mx-auto border-ink/8">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal mb-1">
          Uziemienie zmysłowe 5-4-3-2-1
        </h2>
        <p className="font-sans text-xs text-ink-muted leading-relaxed">
          Proste ćwiczenie uwagi, które pomaga powrócić z natłoku myśli do bezpiecznego tu i teraz.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.count}
              onClick={() => setCurrentStep(idx)}
              className={`p-4 rounded-card border transition-all cursor-pointer ${
                isCurrent
                  ? "bg-paper-surface border-warm-amber/40 shadow-quiet-sm ring-1 ring-warm-amber/20"
                  : isDone
                  ? "bg-paper-dark/30 border-ink/6 opacity-75"
                  : "bg-paper-dark/10 border-ink/4 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-paper-dark/60 text-warm-amber">
                    {step.icon}
                  </div>
                  <h3 className="font-serif text-base text-ink font-medium">
                    {step.title}
                  </h3>
                </div>

                {isDone ? (
                  <span className="p-1 rounded-full bg-warm-sage/20 text-warm-sage">
                    <Check size={13} strokeWidth={2} />
                  </span>
                ) : (
                  <span className="text-[11px] font-sans text-ink-subtle">
                    Krok {idx + 1}/5
                  </span>
                )}
              </div>

              <p className="font-sans text-xs text-ink-muted ml-8 leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
