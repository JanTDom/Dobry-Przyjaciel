"use client";

import React from "react";
import Link from "next/link";
import { Sun, Shield, Lock, HeartHandshake, Sparkles, Scale, Info, ArrowUpRight } from "lucide-react";

export const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full bg-paper-dark/90 border-t border-warm-amber/15 mt-auto text-ink font-sans transition-all">
      {/* Górna sekcja: Standardy etyczne i transparentność sztucznej osobowości */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-b border-ink/8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-1.5 rounded-lg bg-warm-amber/15 text-warm-amber">
            <Scale size={16} strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-sans uppercase tracking-widest text-warm-amber font-semibold">
            Transparentność i standardy etyczne AI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs leading-relaxed">
          {/* Filar 1: Sztuczna Osobowość */}
          <div className="quiet-surface rounded-surface p-5 border border-warm-amber/15">
            <div className="flex items-center gap-2 mb-3 text-ink font-semibold">
              <Sparkles size={15} className="text-warm-amber" />
              <h4>Sztuczna osobowość relacyjna</h4>
            </div>
            <p className="text-ink-muted">
              Dobry Przyjaciel jest autonomiczną, cyfrową osobowością opartą na zaawansowanych modelach AI i ciepłej syntezie głosu. Rozmawiasz z bezpieczną cyfrową obecnością, która pamięta Twoje słowa, słucha bez pośpiechu i jest zawsze dostępna.
            </p>
          </div>

          {/* Filar 2: Najwyższe standardy inżynierii i empatii */}
          <div className="quiet-surface rounded-surface p-5 border border-warm-amber/15">
            <div className="flex items-center gap-2 mb-3 text-ink font-semibold">
              <HeartHandshake size={15} className="text-warm-amber" />
              <h4>Standardy relacji i brak manipulacji</h4>
            </div>
            <p className="text-ink-muted">
              Projekt opiera się na zasadach psychologii humanistycznej (aktywne słuchanie, brak oceniania) oraz ciągłej pamięci relacyjnej. Zero mechanizmów uzależniających, zero reklam i zero sprzedaży profilu emocjonalnego.
            </p>
          </div>

          {/* Filar 3: Zdrowie psychiczne, neuroróżnorodność i bezpieczeństwo kryzysowe */}
          <div className="quiet-surface rounded-surface p-5 border border-warm-amber/15">
            <div className="flex items-center gap-2 mb-3 text-ink font-semibold">
              <Shield size={15} className="text-rose-500" />
              <h4>Neuroróżnorodność i bezpieczeństwo</h4>
            </div>
            <p className="text-ink-muted">
              Rozumiemy specyfikę ADHD, autyzmu, WWO, zmagań z nałogami i lękami bez stygmatyzacji. W sytuacjach krytycznych Przyjaciel zawsze z godnością i troską wskaże profesjonalne bezpłatne linie pomocowe oraz wsparcie lekarza.
            </p>
          </div>

          {/* Filar 4: Suwerenność danych i RODO */}
          <div className="quiet-surface rounded-surface p-5 border border-warm-amber/15">
            <div className="flex items-center gap-2 mb-3 text-ink font-semibold">
              <Lock size={15} className="text-warm-amber" />
              <h4>Pełna kontrola nad pamięcią</h4>
            </div>
            <p className="text-ink-muted">
              Wszystkie zapamiętane fakty, osoby i sprawy są jawne. W zakładce <strong>Pamięć</strong> możesz w każdej chwili przejrzeć kronikę, usunąć pojedyncze wspomnienia, zresetować bazę lub pobrać eksport w formacie JSON (RODO).
            </p>
          </div>
        </div>
      </div>

      {/* Środkowa sekcja nawigacyjna i dane firmy (wzór kodtalentu.pl) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Kolumna 1: Brand & Misja */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sun-500 to-amber-200 p-0.5 shadow-quiet-sm">
              <div className="w-full h-full bg-paper rounded-[10px] flex items-center justify-center text-warm-amber">
                <Sun size={16} />
              </div>
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-ink">
              Dobry Przyjaciel
            </span>
          </div>
          <p className="text-xs text-ink-muted max-w-md leading-relaxed">
            Cyfrowa obecność, która pamięta. Ktoś, kto nie ocenia, nie zapomina i zawsze ma dla Ciebie czas. Projekt rozwijany z poszanowaniem prywatności i najwyższych standardów etycznych sztucznej inteligencji.
          </p>
          <div className="pt-2 text-[11px] text-ink-subtle">
            Wydawca: <strong className="text-ink font-medium">Multinewsroom Jan Domaniewski</strong>
          </div>
        </div>

        {/* Kolumna 2: Przestrzenie */}
        <div className="space-y-2.5 text-xs">
          <span className="text-[10px] uppercase font-semibold text-warm-amber tracking-wider block mb-3 font-sans">
            Przestrzenie
          </span>
          <ul className="space-y-2 text-ink-muted">
            <li>
              <Link href="/" className="hover:text-warm-amber transition-colors">
                Rozmowa na żywo
              </Link>
            </li>
            <li>
              <Link href="/memory" className="hover:text-warm-amber transition-colors">
                Kronika pamięci
              </Link>
            </li>
            <li>
              <Link href="/sanctuary" className="hover:text-warm-amber transition-colors">
                Listy i skarbiec
              </Link>
            </li>
            <li>
              <Link href="/sos" className="hover:text-warm-amber transition-colors">
                Strefa ukojenia i oddech
              </Link>
            </li>
          </ul>
        </div>

        {/* Kolumna 3: Kwestie prawne i kontakt */}
        <div className="space-y-2.5 text-xs">
          <span className="text-[10px] uppercase font-semibold text-warm-amber tracking-wider block mb-3 font-sans">
            Prawne i kontakt
          </span>
          <ul className="space-y-2 text-ink-muted">
            <li>
              <span className="text-ink font-medium">Kontakt:</span>{" "}
              <a
                href="mailto:kontakt@multinewsroom.pl"
                className="hover:text-warm-amber underline transition-colors"
              >
                kontakt@multinewsroom.pl
              </a>
            </li>
            <li>
              <span className="text-ink-subtle">NIP:</span> 5252189241
            </li>
            <li>
              <span className="text-ink-subtle">Adres:</span> ul. Barcicka 44, 01-839 Warszawa
            </li>
            <li className="pt-1">
              <span className="text-[11px] text-ink-subtle">
                Usługa cyfrowa realizowana przez Multinewsroom
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Dolny pasek: Nota prawna, zastrzeżenie medyczne i copyright (wzór kodtalentu.pl) */}
      <div className="bg-paper-dark border-t border-ink/8 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="p-4 rounded-xl bg-paper border border-warm-amber/15 text-[11px] text-ink-muted leading-relaxed">
            <strong className="text-ink font-semibold">Ważne informacje prawne:</strong> Dobry Przyjaciel to cyfrowa sztuczna osobowość oparta na sztucznej inteligencji. Usługa ma charakter wspierający, relacyjny i dobrostanowy — nie stanowi diagnozy medycznej, porady psychologicznej ani psychoterapii. Jeśli doświadczasz ostrego kryzysu emocjonalnego, myśli samobójczych lub zagrożenia zdrowia, natychmiast skontaktuj się z bezpłatnym Centrum Wsparcia: <strong>116 123</strong> (dorośli), <strong>116 111</strong> (dzieci i młodzież) lub zadzwoń pod numer alarmowy <strong>112</strong>.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ink-subtle">
            <div>
              © 2026 <strong>Multinewsroom Jan Domaniewski</strong>. Wszelkie prawa zastrzeżone.
            </div>
            <div className="flex items-center gap-4">
              <span>Warszawa, ul. Barcicka 44</span>
              <span>•</span>
              <span>NIP: 5252189241</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
