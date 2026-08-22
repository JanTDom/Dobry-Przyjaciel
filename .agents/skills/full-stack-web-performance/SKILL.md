---
name: full-stack-web-performance
description: >-
  Optimize Core Web Vitals (LCP, INP, CLS), SSR streaming, bundle sizes, asset delivery,
  and responsiveness from 320px mobile to 4K displays.
  Activate when auditing frontend performance, optimizing Next.js bundle footprint,
  implementing progressive hydration, or refining responsive layout edge cases.
---

# Full-Stack Web Performance (Maksymalna Wydajność i Responsywność)

Wytyczne zapewniające sub-100ms czas reakcji, 0ms layout shifts oraz perfekcyjne wyniki Core Web Vitals.

## 1. Optymalizacja Core Web Vitals

| Metryka | Cel | Kluczowa technika |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | `< 1.2s` | Preload krytycznych fontów, SSR bez blokujących zewnętrznych skryptów. |
| **INP** (Interaction to Next Paint) | `< 50ms` | Przenoszenie ciężkich operacji audio/canvas do `requestIdleCallback` lub Web Workers. |
| **CLS** (Cumulative Layout Shift) | `0.00` | Jawne wymiary dla wszystkich kontenerów, ikon i dynamicznych komponentów. |

---

## 2. Responsywność Wieloplatformowa (Cross-Device Discipline)

* **Mobile-First & Touch Targets**:
  * Wszystkie przyciski dotykowe na smartfonach: min. `44x44px`.
  * Bezpieczne odstępy od krawędzi ekranu (`pb-safe`, `env(safe-area-inset-bottom)`).
* **Adaptacja do Szerokich Ekranów (Ultra-Wide / 4K)**:
  * Centralne kontenery z ograniczeniem `max-w-6xl` lub `max-w-7xl` z proporcjonalnymi marginesami.
* **Custom Scrollbars & Overflow Isolation**:
  * Zapobieganie poziomemu paskowi przewijania (`overflow-x-hidden` na `body` i `main`).
