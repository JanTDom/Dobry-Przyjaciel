"use client";

import React, { useState } from "react";
import { Eye, Hand, Ear, Sparkles, Heart, CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";

export const GroundingExercise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      count: 5,
      icon: <Eye className="w-6 h-6 text-sky-400" />,
      title: "5 rzeczy, które WIDZISZ",
      desc: "Rozejrzyj się wokół siebie powoli. Nazwij w myślach lub na głos 5 konkretnych przedmiotów (np. kubek na biurku, cienie na ścianie, Twoje buty).",
      prompt: "Wzrok sprowadza umysł do tu i teraz."
    },
    {
      count: 4,
      icon: <Hand className="w-6 h-6 text-teal-400" />,
      title: "4 rzeczy, które CZUJESZ DOTYKIEM",
      desc: "Poczuj fizyczny kontakt ze światem: dotknij tkaniny swoich spodni, chłodu blatu biurka, oparcia fotela pod plecami lub swoich dłoni.",
      prompt: "Twoje ciało jest bezpieczne w tym miejscu."
    },
    {
      count: 3,
      icon: <Ear className="w-6 h-6 text-amber-400" />,
      title: "3 dźwięki, które SŁYSZYSZ",
      desc: "Wsłuchaj się w tło: szum komputera, odgłos aut za oknem, szelest ubrań, Twój własny oddech.",
      prompt: "Dźwięki przychodzą i odchodzą jak fale."
    },
    {
      count: 2,
      icon: <Sparkles className="w-6 h-6 text-rose-400" />,
      title: "2 zapachy, które możesz POCZUĆ",
      desc: "Weź wdech nosem. Poczuj zapach kawy, świeżego powietrza, mydła na dłoniach lub wyobraź sobie swój ulubiony uspokajający zapach.",
      prompt: "Układ węchowy łączy się bezpośrednio z ośrodkiem spokoju."
    },
    {
      count: 1,
      icon: <Heart className="w-6 h-6 text-emerald-400" />,
      title: "1 rzecz, za którą jesteś WDZIĘCZNY w sobie",
      desc: "Jedna mała rzecz: to, że oddychasz, że walczysz o siebie, że dotrwałeś do dzisiaj pomimo wszystkich trudności.",
      prompt: "Jesteś o wiele silniejszy niż Twój lęk."
    }
  ];

  const step = steps[currentStep];
  const isFinished = currentStep >= steps.length;

  return (
    <div className="w-full bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
      {!isFinished ? (
        <div className="flex flex-col space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step.icon}
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Krok {currentStep + 1} z {steps.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentStep ? "bg-amber-400 w-6" : i < currentStep ? "bg-emerald-400" : "bg-surface-50"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{step.title}</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{step.desc}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-100/70 border border-white/5 text-xs text-amber-200/90 italic">
            &ldquo;{step.prompt}&rdquo;
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl hover:opacity-95 active:scale-98 transition-all"
            >
              <span>Zrobione, przejdź dalej</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Jesteś uziemiony i bezpieczny</h3>
          <p className="text-sm text-slate-300 max-w-md">
            Właśnie wyregulowałeś swój układ nerwowy. Twój umysł powrócił do ciała. Pamiętaj, że możesz powtarzać to ćwiczenie za każdym razem, gdy czujesz przeciążenie.
          </p>
          <button
            onClick={() => setCurrentStep(0)}
            className="px-6 py-2.5 rounded-2xl bg-surface-100 text-slate-200 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Powtórz ćwiczenie</span>
          </button>
        </div>
      )}
    </div>
  );
};
