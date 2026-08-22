"use client";

import React, { useState } from "react";
import { Eye, Hand, Ear, Sparkles, Coffee, Check } from "lucide-react";

export const GroundingExercise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      count: 5,
      icon: <Eye size={18} className="text-hearth-400" />,
      title: "5 rzeczy, które widzisz dookoła",
      desc: "Zwróć uwagę na detale: kształt cienia na ścianie, fakturę stołu, kolor kubka.",
    },
    {
      count: 4,
      icon: <Hand size={18} className="text-hearth-400" />,
      title: "4 rzeczy, które możesz dotknąć",
      desc: "Poczuj oparcie fotela pod plecami, materiał swoich ubrań, chłód biurka pod dłońmi.",
    },
    {
      count: 3,
      icon: <Ear size={18} className="text-hearth-400" />,
      title: "3 dźwięki, które słyszysz",
      desc: "Wycisz się i wsłuchaj: szum wiatru za oknem, tykanie zegara, odgłos własnego oddechu.",
    },
    {
      count: 2,
      icon: <Sparkles size={18} className="text-hearth-400" />,
      title: "2 zapachy, które możesz wyczuć",
      desc: "Aromat parzącej się kawy, świeże powietrze, zapach drewnianego mebla.",
    },
    {
      count: 1,
      icon: <Coffee size={18} className="text-hearth-400" />,
      title: "1 dobry smak w ustach lub wdzięczność",
      desc: "Łyk ciepłej wody lub pomyśl o jednej dobrej rzeczy, którą dziś przeżyłeś.",
    },
  ];

  return (
    <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-sanctuary-700/60 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-hearth-500/15 text-hearth-400 border border-hearth-500/30">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-sanctuary-100 font-normal">
            Uziemienie zmysłowe 5-4-3-2-1
          </h2>
          <p className="font-sans text-xs text-sanctuary-400 mt-0.5">
            Sprawdzona metoda powrotu z paraliżującego lęku do bezpiecznego tu i teraz
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.count}
              onClick={() => setCurrentStep(idx)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isCurrent
                  ? "bg-hearth-500/15 border-hearth-500/50 shadow-lg shadow-hearth-500/5"
                  : isDone
                  ? "bg-sanctuary-900/40 border-sanctuary-800 opacity-60"
                  : "bg-sanctuary-900/30 border-sanctuary-850 opacity-40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sanctuary-800">
                    {step.icon}
                  </div>
                  <h3 className="font-serif text-base text-sanctuary-100 font-medium">
                    {step.title}
                  </h3>
                </div>

                {isDone ? (
                  <span className="p-1 rounded-full bg-hearth-500/20 text-hearth-400">
                    <Check size={14} />
                  </span>
                ) : (
                  <span className="text-xs font-sans text-sanctuary-500 font-mono">
                    Krok {idx + 1}/5
                  </span>
                )}
              </div>

              <p className="font-sans text-xs text-sanctuary-300 ml-9">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
