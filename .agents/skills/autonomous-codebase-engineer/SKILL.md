---
name: autonomous-codebase-engineer
description: >-
  Lead complex software engineering, full-stack architectural refactors, automated testing,
  and self-healing build pipelines. Activate when designing modular enterprise applications,
  fixing difficult architectural regressions, implementing test-driven development (TDD),
  or validating complex interactive UI/UX flows with Puppeteer.
---

# Autonomous Codebase Engineer (Inżynieria Złożonych Codebase'ów)

Standard inżynieryjny dla tworzenia czystego, modularnego i bezbłędnego oprogramowania na poziomie senior software architect.

## 1. Pętla Ciągłej Weryfikacji (Continuous Verification Loop)

```
  [Implementacja] ──► [TypeScript Pass] ──► [Linter & Build] ──► [Visual QA (Puppeteer)] ──► [Delivery]
         ▲                                                              │
         │                                                              ▼
         └──────────────────── [Automated Self-Correction] ─────────────┘
```

1. **Zero Domysłów**: Każda zmiana w kodzie musi zostać zweryfikowana poleceniem kompilacji (`next build` / `tsc --noEmit`).
2. **Empiryczna Weryfikacja Wizualna**: Dla komponentów UI uruchom serwer dev i wykonaj zrzut ekranu przez MCP Puppeteer (`puppeteer_screenshot`), aby ocenić hierarchię, marginesy i typografię.
3. **Self-Correction**: Jeśli kompilator lub Puppeteer wykaże błąd, zdiagnozuj przyczynę źródłową i napraw bez czekania na monit użytkownika.

---

## 2. Zasady Czystej Architektury (Clean Modular Architecture)

* **Feature-Sliced Design**: Moduły logiczne pogrupowane wokół domen biznesowych (`presence`, `conversation`, `memory`, `sos`, `sanctuary`).
* **Separacja Stanu**:
  * *Server State*: API routes, synchronizacja z bazą.
  * *Client Persisted State*: IndexedDB / localStorage z bezpieczną hydratacją SSR.
  * *Transient UI State*: React State / Context dla animacji i audio.
* **Single Responsibility**: Komponenty UI odpowiadają wyłącznie za prezentację; logika biznesowa i syntezatory audio wydzielone do `lib/`.
