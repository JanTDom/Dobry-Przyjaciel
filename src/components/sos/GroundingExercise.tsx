"use client";

import React, { useState } from "react";
import { Eye, Hand, Ear, Sparkles, Coffee, Check } from "lucide-react";

export const GroundingExercise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      count: 5,
      icon: <Eye size={18} className="text-sun-600" />,
      title: "5 rzeczy, które widzisz dookoła",
      desc: "Zwróć uwagę na detale: kształt cienia na ścianie, fakturę stołu, kolor kubka.",
    },
    {
      count: 4,
      icon: <Hand size={18} className="text-sun-600" />,
      title: "4 rzeczy, które możesz dotknąć",
      desc: "Poczuj oparcie fotela pod plecami, materiał swoich ubrań, chłód biurka pod dłońmi.",
    },
    {
      count: 3,
      icon: <Ear size={18} className="text-sun-600" />,
      title: "3 dźwięki, które słyszysz",
      desc: "Wycisz się i wsłuchaj: szum wiatru za oknem, tykanie zegara, odgłos własnego oddechu.",
    },
    {
      count: 2,
      icon: <Sparkles size={18} className="text-sun-600" />,
      title: "2 zapachy, które możesz wyczuć",
      desc: "Aromat parzącej się kawy, świeże powietrze, zapach drewnianego mebla.",
    },
    {
      count: 1,
      icon: <Coffee size={18} className="text-sun-600" />,
      title: "1 dobry smak w ustach lub wdzięczność",
      desc: "Łyk ciepłej wody lub pomyśl o jednej dobrej rzeczy, którą dziś przeżyłeś.",
    },
  ];

  return (
    <div className="sanctuary-card rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-sun-100 text-sun-600 border border-sun-200">
          <Sparkles size={22} />
        </div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal">
            Uziemienie zmysłowe 5-4-3-2-1
          </h2>
          <p className="font-sans text-xs text-cream-600 mt-0.5">
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
                  ? "bg-sun-50 border-sun-400 shadow-md shadow-sun-500/10 ring-2 ring-sun-400/20"
                  : isDone
                  ? "bg-cream-50/70 border-cream-300 opacity-75"
                  : "bg-cream-50/40 border-cream-200 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-white border border-cream-200">
                    {step.icon}
                  </div>
                  <h3 className="font-serif text-base text-cream-950 font-medium">
                    {step.title}
                  </h3>
                </div>

                {isDone ? (
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={15} />
                  </span>
                ) : (
                  <span className="text-xs font-sans text-cream-500 font-mono font-medium">
                    Krok {idx + 1}/5
                  </span>
                )}
              </div>

              <p className="font-sans text-xs text-cream-800 ml-9">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
