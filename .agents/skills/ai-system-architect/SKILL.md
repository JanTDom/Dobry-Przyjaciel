---
name: ai-system-architect
description: >-
  Architect and build production-grade AI systems, LLM backends, long-term memory engines,
  vector search (RAG), voice streaming pipelines (TTS/STT), semantic caches, and autonomous agent systems.
  Activate when implementing AI models (OpenAI, Anthropic, Gemini, DeepSeek, ElevenLabs, Groq, Ollama),
  pgvector embeddings, prompt chains, or structured tool calling.
---

# AI System Architect (Architektura Systemów AI & LLM)

Ten skill zawiera wytyczne architektoniczne do budowy odpornych, szybkich i skalowalnych aplikacji napędzanych sztuczną inteligencją.

## 1. Architektura Pamięci Długoterminowej (Living Relational Memory)

```
  [User Message] ──────────────────────────┐
         │                                 ▼
         ▼                      ┌─────────────────────┐
  ┌──────────────┐              │ Ekstrakcja Faktów   │
  │ Router LLM   │              │ (Entities & Triggers│
  └──────┬───────┘              └──────────┬──────────┘
         │                                 ▼
         ▼                      ┌─────────────────────┐
  ┌──────────────┐              │ Relational Graph    │
  │ Hybrid RAG   │◄─────────────┤ + Vector Embeddings │
  │ (Vector+BM25)│              │ (PostgreSQL/pgvector│
  └──────┬───────┘              └─────────────────────┘
         ▼
  ┌──────────────┐
  │ Response LLM │ ───► [Streaming Output / TTS]
  └──────────────┘
```

### Zasady Projektowania Pamięci:
1. **Separacja Pamięci Epizodycznej i Semantycznej**:
   * *Pamięć epizodyczna*: Historia ostatnich wiadomości sesji (przesuwające się okno kontekstu).
   * *Pamięć relacyjna*: Baza wiedzy o użytkowniku (osoby z życia, wartości, wrażliwe punkty, pokonane kryzysy).
2. **Ekstrakcja w Tle (Asynchronous Fact Extraction)**:
   * Nie blokuj generowania odpowiedzi użytkownikowi.
   * Ekstrahuj nowe fakty w tle (asynchronicznie) i aktualizuj graf relacji.
3. **Structured Output (JSON Schema / Zod)**:
   * Zawsze wymuszaj schematy JSON na wyjściach modeli klasyfikujących i ekstrahujących.

---

## 2. Potok Dźwiękowy i Głosowy (Voice & Audio Pipeline)

### Synteza Mowy (TTS) i Streaming:
* **Web Audio API**: Wbudowane generatory tła (deszcz, fale oceanu, fale alfa 8Hz) bezpośrednio w przeglądarce bez opóźnień sieciowych.
* **ElevenLabs / OpenAI Voice API**: Buforowanie fragmentów audio i streaming PCM/MP3 dla ultra-niskich opóźnień.
* **Fallback Cascade**: Jeśli zewnętrzne API głosu jest niedostępne, płynny fallback na przeglądarkowe `window.speechSynthesis` z doborem najlepszego głosu naturalnego.

---

## 3. Bezpieczeństwo i Guardrails (Psychological & System Safety)
* **Kryzys Emocjonalny & SOS Detection**: Wykrywanie słów kluczowych kryzysu (panika, załamanie) i natychmiastowe przekierowanie do modułu uziemienia (5-4-3-2-1, oddech pudełkowy) oraz prezentacja numerów alarmowych.
* **Ochrona Promptów & Sekretów**: Nigdy nie przekazuj kluczy API do klienta. Cała komunikacja z modelami przez bezpieczne API routes.
