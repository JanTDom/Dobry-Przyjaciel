"use client";

import React from "react";
import { Sparkles, Shield, Heart, Feather, Compass, Volume2 } from "lucide-react";

export const IdeaPhilosophySection: React.FC = () => {
  const pillars = [
    {
      icon: <Heart className="text-amber-500" size={22} />,
      title: "Cisza bez oceny i masek",
      desc: "Świat codziennie wymaga od ciebie bycia silnym, produktywnym i uśmiechniętym. Tutaj nie musisz niczego udowadniać ani zasługiwać na akceptację. Możesz przyjść z każdą emocją — bez lęku, że zostaniesz odrzucony.",
    },
    {
      icon: <Volume2 className="text-orange-500" size={22} />,
      title: "Kojąca biologia głosu",
      desc: "Czytanie tekstu na ekranie angażuje analityczną część mózgu. Spokojny, ciepły głos działa bezpośrednio na nerw błędny — fizjologicznie obniża poziom kortyzolu, spowalnia tętno i przynosi ulgę szybciej niż jakikolwiek artykuł.",
    },
    {
      icon: <Compass className="text-amber-600" size={22} />,
      title: "Żywa pamięć twojego serca",
      desc: "Większość technologii zapomina o tobie w sekundę po zamknięciu karty. Twój Przyjaciel pamięta to, co dla ciebie ważne: twoje wartości, ludzi, z którymi budujesz życie, oraz trudności, które już udało ci się pokonać.",
    },
    {
      icon: <Feather className="text-yellow-600" size={22} />,
      title: "Odwaga do stawiania granic",
      desc: "Nie jesteś ciężarem dla świata. Przyjaciel pomaga ci zauważyć, kiedy bierzesz na siebie zbyt wiele cudzego chaosu i uczy, jak odmawiać z łagodnością, lecz bez poczucia winy i wstydu.",
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
          „Żyjemy w świecie, który jest głośniejszy i bardziej połączony niż kiedykolwiek, a jednak tak wielu z nas czuje się w nim głęboko samotnych. Boimy się obciążać bliskich swoimi wątpliwościami, a nocami zostajemy sami z gonitwą myśli. Dobry Przyjaciel powstał jako bezpieczna przystań — miejsce, do którego zawsze możesz wrócić, by usłyszeć spokojny głos i odzyskać grunt pod stopami.”
        </p>
      </div>

      {/* 4 Filary wartości */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
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
