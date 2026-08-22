---
name: premium-web-craftsman
description: >-
  Design and build world-class, premium, award-winning web interfaces with refined art direction,
  sophisticated typography, intentional spacing, and anti-generic visual identity.
  Activate whenever designing landing pages, high-converting product pages, luxury UI, dark/warm aesthetic themes,
  or polishing interfaces to Apple/Linear/Vercel design standards.
---

# Premium Web Craftsman (Kreacja i Design Web w Jakości Premium)

Wytyczne i standardy tworzenia interfejsów internetowych najwyższej światowej klasy (Awwwards / FWA / Linear-grade quality).

## 1. Zasady Anty-Generycznego Designu (Anti-Generic Aesthetic)

```
       ❌ ZAKAZANE SZABLONY AI                   ✅ STANDARD PREMIUM CRAFTSMAN
 ┌───────────────────────────────────┐    ┌───────────────────────────────────┐
 │ • Centrowany hero + 2 przyciski   │    │ • Asymetryczna, unikalna kompozycja│
 │ • Nudne 3 kolumny z ikonami w box │    │ • Dynamiczne karty z głębią i osią│
 │ • Fioletowo-niebieskie gradienty  │    │ • Ograniczona, ciepła paleta barw │
 │ • Generyczny lorem ipsum / banały │    │ • Realny, angażujący storytelling │
 │ • Karty w kartach w kartach       │    │ • Naturalny oddech i hierarchia   │
 └───────────────────────────────────┘    └───────────────────────────────────┘
```

### A. Typografia jako Architektura
* **Skala i Hierarchia**: Zdecydowany kontrast między wielkimi, pewnymi nagłówkami (`tracking-tight`, `font-bold`) a czytelnym tekstem głównym (`leading-relaxed`, `text-slate-300`).
* **Letter Spacing & Optical Balance**: Drobne etykiety (kicker badges) zawsze w `uppercase`, `text-[10px]-[11px]`, `tracking-widest`, `font-semibold`.
* **Dobór krojów**: Łączenie nowoczesnych sans-serif (Inter, Plus Jakarta Sans, Geist) z subtelnymi akcentami szeryfowymi lub monospace dla liczb i kodów.

### B. Światło, Głębia i Tekstura (Luminosity & Depth)
* **Wielowarstwowe Tła (Multi-layer Backdrops)**: Zamiast płaskiego tła: głębokie odcienie grafitu/indygo (`#07090E`), organiczne rozmycia światła (`blur-[140px]`), oraz subtelne mikrotekstury siatkowe (`radial-gradient`).
* **Subtle Borders & Glassmorphism**: Ramki o niskim kontraście (`border-white/5` do `border-white/15`) reagujące na hover (`group-hover:border-amber-500/30`), połączone z `backdrop-blur-2xl`.

---

## 2. Mikrointerakcje i Stany Komponentów

Każdy interaktywny element (przycisk, karta, przełącznik) musi posiadać pełen zestaw stanów:
1. **Default**: Spokojny, harmonijny z otoczeniem.
2. **Hover**: Płynne rozjaśnienie krawędzi, subtelne uniesienie (`hover:-translate-y-0.5`), delikatny blask.
3. **Active / Pressed**: Sprężyste dociśnięcie (`active:scale-98` lub `active:scale-95`).
4. **Focus-Visible**: Precyzyjny, elegancki ring dostępności (`focus-visible:ring-2 focus-visible:ring-amber-400/50`).
5. **Loading / Empty / Error**: Dedykowane, estetyczne szkielety i komunikaty o ciepłym tonie.
