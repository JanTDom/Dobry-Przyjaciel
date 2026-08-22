---
name: multi-agent-orchestrator
description: >-
  Orchestrate complex, multi-step engineering projects using teams of autonomous AI subagents.
  Activate whenever planning large-scale architectures, parallel code generation, multi-file refactors,
  swarm research, peer code review, or multi-agent delegation pipelines using invoke_subagent and define_subagent.
---

# Multi-Agent Orchestrator (Zaawansowana Orkiestracja Agentów AI)

Ten skill definiuje wzorce i protokoły orkiestracji wieloagentowej do realizacji skomplikowanych projektów programistycznych i produktowych.

## 1. Topologie Zespołów Agentów

```
                          ┌────────────────────────┐
                          │   ORCHESTRATOR / LEAD  │
                          └───────────┬────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
  ┌──────────────┐             ┌──────────────┐             ┌──────────────┐
  │  RESEARCHER  │             │   BACKEND    │             │   FRONTEND   │
  │  (Analiza)   │             │  ARCHITECT   │             │   DESIGNER   │
  └──────────────┘             └──────────────┘             └──────────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      ▼
                               ┌──────────────┐
                               │  QA & REVIEW │
                               │  (Weryf.)    │
                               └──────────────┘
```

### A. Wzorzec Manager-Worker (Domyślny dla dużych funkcji)
1. **Lead Agent (Koordynator)**: Definiuje specyfikację (`implementation_plan.md`), dzieli zadanie na atomowe domeny i zleca pracę subagentom.
2. **Worker Agents**: Dedykowani subagenci realizujący niezależne moduły w odizolowanych kontekstach (`Workspace: "inherit"` lub `"share"`).
3. **Consolidation**: Koordynator odbiera wyniki, łączy kod i przeprowadza pełną weryfikację integracyjną.

### B. Wzorzec Spec-First Pipeline
1. **Agent 1 (Spec & Types)**: Tworzy kontrakty TypeScript, interfejsy i schematy bazodanowe.
2. **Agent 2 (Core Logic & Libs)**: Implementuje silniki biznesowe, algorytmy i integracje zewnętrzne.
3. **Agent 3 (UI & Visual Experience)**: Buduje komponenty wizualne, animacje i interakcje.
4. **Agent 4 (QA & Edge Cases)**: Prowadzi testy kompilacji, linters oraz visual regression w Puppeteer.

---

## 2. Narzędzia i Protokoły Komunikacji

### A. Dynamiczne Definiowanie Subagentów (`define_subagent`)
Używaj `define_subagent`, aby powołać do życia wyspecjalizowanych ekspertów:
* **`SecurityAuditor`**: Analiza podatności, wycieków kluczy i sanitizacji inputów.
* **`PerformanceOptimizer`**: Profilowanie renderowania, Core Web Vitals, optymalizacja pamięci.
* **`DomainSpecialist`**: Dedykowany ekspert pod konkretną bibliotekę (np. Web Audio API, WebSockets, pgvector).

### B. Równoległe Uruchamianie (`invoke_subagent`)
* Zlecaj niezależne badania i implementacje równolegle w jednym wywołaniu `invoke_subagent`.
* Nie poluj w pętli – system obudzi agenta nadrzędnego automatycznie po zakończeniu pracy subagenta.

---

## 3. Standard Dekompozycji Zadań (Task Decomposition Checklist)

Przed uruchomieniem subagentów upewnij się, że:
- [ ] Każdy subagent ma jasno zdefiniowane wejście (pliki źródłowe, interfejsy).
- [ ] Każdy subagent ma zdefiniowany format wyjścia (konkretne zmodyfikowane pliki lub raport JSON).
- [ ] Brak nakładających się edycji w tych samych plikach przez dwóch równoległych agentów.
- [ ] Zdefiniowano kryteria sukcesu (np. `npm run build` przechodzi bez błędów).
