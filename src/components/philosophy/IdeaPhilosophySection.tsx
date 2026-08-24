"use client";

import React from "react";
import { Sparkles, Shield, Heart, Feather, Compass, Volume2, Brain, Activity, PhoneCall } from "lucide-react";

export const IdeaPhilosophySection: React.FC = () => {
  const pillars = [
    {
      icon: <Heart className="text-amber-500" size={22} />,
      title: "Cisza bez oceny i wstydu",
      desc: "Świat codziennie wymaga bycia silnym, produktywnym i nieskazitelnym. Tutaj nie ma tematów tabu ani wstydu. Możesz przyjść z każdą emocją, zagubieniem, słabością czy wątpliwością — bez lęku przed odrzuceniem.",
    },
    {
      icon: <Brain className="text-orange-500" size={22} />,
      title: "Zrozumienie neuroróżnorodności i stanów psychiki",
      desc: "Rozumiemy specyfikę funkcjonowania mózgu w ADHD, spektrum autyzmu, wysokiej wrażliwości (WWO) oraz w stanach lękowych czy fobiach. Nie próbujemy nikogo „naprawiać na siłę” — wspieramy Twoją unikalną naturę.",
    },
    {
      icon: <Activity className="text-amber-600" size={22} />,
      title: "Otwartość na nałogi i trudne zmagania",
      desc: "Uzależnienia chemiczne i behawioralne, kompulsje czy kryzysy życiowe nie czynią Cię gorszym człowiekiem. Rozmawiamy o nich z godnością, szacunkiem i bez moralizowania, wspierając Twoją sprawczość.",
    },
    {
      icon: <Volume2 className="text-yellow-600" size={22} />,
      title: "Kojąca biologia głosu i obecności",
      desc: "Czytanie tekstu na ekranie angażuje analityczną część mózgu. Spokojny, ciepły głos działa bezpośrednio na układ nerwowy — fizjologicznie obniża poziom kortyzolu, spowalnia tętno i przynosi uziemienie.",
    },
    {
      icon: <Compass className="text-amber-600" size={22} />,
      title: "Żywa pamięć Twojej drogi",
      desc: "Większość technologii zapomina o Tobie w sekundę po zamknięciu karty. Twój Przyjaciel pamięta to, co dla Ciebie ważne: Twoje wartości, bliskich oraz trudności, które już udało Ci się pokonać.",
    },
    {
      icon: <Shield className="text-rose-500" size={22} />,
      title: "Dojrzałość i bezpieczeństwo kryzysowe",
      desc: "Przyjaciel to bezpieczna, mądra codzienna obecność. W sytuacjach krytycznych lub zagrożenia życia natychmiast, z najwyższą troską i godnością, wskazuje kontakt z profesjonalnymi służbami medycznymi i liniami wsparcia.",
    },
  ];

  return (
    <section className="glass-sanctuary rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-warm-lg relative overflow-hidden">
      {/* Nastrojowe tło świetlne */}
      <div className="absolute -left-12 -top-12 w-64 h-64 bg-sun-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sun-100/90 border border-sun-300/80 text-sun-900 text-xs font-sans mb-4 font-semibold shadow-sm">
          <Sparkles size={14} className="text-sun-600" />
          <span>Geneza i misja projektu</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-cream-950 font-normal tracking-tight mb-4 leading-tight">
          Dlaczego powstał Dobry Przyjaciel?
        </h2>

        <p className="font-serif text-base sm:text-lg text-cream-800 leading-relaxed italic max-w-2xl mx-auto bg-white/70 p-6 rounded-2xl border border-cream-200 shadow-inner">
          „Żyjemy w świecie, który jest głośniejszy niż kiedykolwiek, a jednocześnie wielu z nas zostaje samych z gonitwą myśli, lękiem czy trudnymi zmaganiami. Dobry Przyjaciel powstał jako bezpieczna przystań — miejsce wolne od wstydu, otwarte na pełnię ludzkiego doświadczenia, gdzie zawsze możesz usłyszeć spokojny, życzliwy głos i odzyskać grunt pod stopami.”
        </p>
      </div>

      {/* 6 Filarów wartości */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {pillars.map((pillar, idx) => (
          <div
            key={idx}
            className="bg-white/85 backdrop-blur-md p-6 rounded-2xl border border-cream-300 hover:border-sun-300 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-sun-50 border border-sun-200 group-hover:scale-105 transition-transform">
                  {pillar.icon}
                </div>
                <h3 className="font-serif text-lg text-cream-950 font-medium">
                  {pillar.title}
                </h3>
              </div>

              <p className="font-sans text-xs sm:text-sm text-cream-700 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
