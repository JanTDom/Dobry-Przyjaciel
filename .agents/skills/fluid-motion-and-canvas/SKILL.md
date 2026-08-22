---
name: fluid-motion-and-canvas
description: >-
  Implement buttery-smooth 60/120fps animations, physics-based springs, interactive canvas visualizers,
  WebGL shaders, scroll-driven reveals, and rich sensory micro-interactions.
  Activate when adding Framer Motion transitions, Canvas 2D particle fields, audio wave visualizers,
  parallax scrolling, or interactive tactile feedback.
---

# Fluid Motion & Canvas (Płynna Dynamika & Grafika Generatywna)

Standard implementacji ruchu, kinetyki i generatywnych efektów wizualnych w nowoczesnej przeglądarce.

## 1. Fizyka Ruchu (Spring Physics over Linear Timing)

* **Naturalna Bezwładność**: Unikaj sztywnych animacji liniowych (`ease-in-out` o stałym czasie). Wykorzystuj fizykę sprężyn:
  ```tsx
  transition={{ type: "spring", stiffness: 350, damping: 25 }}
  ```
* **Kaskadowe Ujawnianie (Staggered Children)**: Elementy list i siatek pojawiają się z drobnym opóźnieniem (`staggerChildren: 0.06`), tworząc wrażenie organicznego napływu treści.

---

## 2. Generatywny Canvas 2D i WebGL (Wydajność 60fps)

### Najlepsze Praktyki dla Canvas:
1. **DPR Scaling (High-DPI / Retina Displays)**:
   * Zawsze uwzględniaj `window.devicePixelRatio`, aby grafika była ostra jak żyleta na ekranach 4K i iPhone Retina.
2. **Zarządzanie Pętlą Animacji (`requestAnimationFrame`)**:
   * Zawsze czyść `cancelAnimationFrame` w `useEffect cleanup`, zapobiegając wyciekom pamięci.
3. **Optymalizacja Matematyczna**:
   * Pre-kalkuluj tablice sinusów/cosinusów i unikaj alokacji obiektów wewnątrz pętli renderującej `render()`.

---

## 3. View Transitions & Gestures
* **Płynne Przejścia Stron (Page Transitions)**: Używaj animowanych layoutów z zachowaniem ciągłości wspólnych elementów (np. paska audio czy nawigacji).
* **Tactile Haptic Feel**: Dźwiękowe i wizualne sprzężenie zwrotne przy kluczowych akcjach (zapis, odtworzenie notatki głosowej, uziemienie).
