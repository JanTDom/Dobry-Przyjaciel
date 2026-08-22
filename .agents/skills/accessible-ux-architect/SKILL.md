---
name: accessible-ux-architect
description: >-
  Architect accessible, inclusive, intuitive, and frictionless user experiences (WCAG 2.2 AA).
  Activate when implementing keyboard navigation, screen reader ARIA trees, focus management in modals/drawers,
  color contrast validation, or sensory-friendly calming UI patterns.
---

# Accessible UX Architect (Dostępność i Architektura Doświadczeń)

Projektowanie produktów cyfrowych dostępnych dla każdego człowieka, ze szczególnym uwzględnieniem osób w stanach przeciążenia poznawczego i sensorycznego.

## 1. Dostępność Sensoryczna & Psychologiczna (Sensory-Friendly Design)

* **Redukcja Przebodźcowania**: Unikanie gwałtownych błysków i migoczących elementów.
* **Wsparcie dla `prefers-reduced-motion`**: Poszanowanie ustawień systemowych użytkownika z automatycznym wygaszaniem intensywnych animacji.
* **Uspokajające Kontrasty**: Zachowanie czytelności tekstu (min. 4.5:1 kontrastu) przy jednoczesnym unikaniu jaskrawych, agresywnych barw neonowych.

---

## 2. Dostępność Techniczna (WCAG 2.2 AA Standards)

* **Klawiatura & Focus Trapping**:
  * Modale (np. `SubscriptionModal`) muszą przechwytywać focus, zamykać się klawiszem `Escape` i zwracać focus do elementu wyzwalającego.
* **Semantyka ARIA**:
  * Odtwarzacze audio posiadają precyzyjne atrybuty `aria-label`, `role="region"`, `aria-live="polite"`.
* **Formularze & Walidacja**:
  * Wyraźne etykiety, natychmiastowe wyjaśnienia błędów bez kasowania wpisanych danych.
