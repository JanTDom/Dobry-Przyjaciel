---
name: companion-prompt-engineer
description: >-
  Ekspert od systemu promptów AI dla Dobrego Przyjaciela. Aktywuj gdy
  zmieniasz zachowanie Małgosi/przyjaciela (system prompt w /api/chat/route.ts),
  naprawiasz tryb terapeutyczny, dostrajasz ton rozmowy, gramatykę płciową,
  formatowanie dla TTS lub protokół kryzysowy.
---

# Companion Prompt Engineer — Dobry Przyjaciel

## Kluczowy plik
`src/app/api/chat/route.ts` — system prompt + post-processing funkcje.

---

## 1. Architektura promptu

```
systemPrompt
  ├── Tożsamość (kim jest companion)
  ├── ZASADA FUNDAMENTALNA — DOPASUJ REAKCJĘ DO TONU
  │   ├── ▸ KIEDY ŚWIETNY NASTRÓJ → ciesz się razem
  │   ├── ▸ KIEDY TEMAT MERYTORYCZNY → wejdź w temat
  │   ├── ▸ KIEDY ŻART → ripostuj
  │   ├── ▸ KIEDY FRUSTRACJA → potwierdź, nie dramatyzuj
  │   ├── ▸ KIEDY SMUTEK → słuchaj, nie radzaj
  │   ├── ▸ KIEDY ZŁOŚĆ → towarzysz, nie uspokajaj
  │   └── ▸ KIEDY PYTANIE O FAKTY → odpowiedz rzeczowo
  ├── CZEGO NIE ROBIĆ (lista antypatternów)
  ├── ZASADY TECHNICZNE (długość, MIME, płeć, wielkość liter)
  ├── PROTOKÓŁ KRYZYSOWY (TYLKO przy wyraźnym sygnale)
  ├── KONTEKST WSPOMNIEŃ (dynamiczny z profilu)
  └── FORMAT JSON
```

## 2. Post-processing pipeline (kolejność krytyczna)

```ts
// W route.ts, po otrzymaniu odpowiedzi od GPT:
let cleanReply = parsed.reply.trim();
cleanReply = cleanMarkdownForSpeech(cleanReply); // 1. usuń markdown
cleanReply = cleanGreetingPrefix(cleanReply);    // 2. usuń powitania
if (!isMale) cleanReply = enforceFemaleGrammar(cleanReply); // 3. żeńskie formy
cleanReply = formatSentenceCapitalization(cleanReply); // 4. wielkość liter
```

## 3. Krytyczne pułapki promptowania

### ❌ Zbyt terapeutyczny
```
// ZŁE — model zakłada że zawsze coś jest nie tak:
"Jesteś najwybitniejszym psychoterapeutą..."
"Dajesz natychmiastowe poczucie bezpieczeństwa..."
"Zdejmujesz ciężar wstydu, lęku i napięcia..."
```

### ✅ Prawdziwy przyjaciel
```
// DOBRE — model reaguje na co faktycznie padło:
"Reaguj DOKŁADNIE na to, co user powie, w odpowiednim tonie i nastroju."
"Jeśli mówi że jest świetnie → CIESZYSZ SIĘ RAZEM Z NIM."
"NIGDY nie zakładaj że coś jest nie tak."
```

## 4. Parametry modelu

```ts
model: "gpt-4o-mini",
temperature: 0.85,    // 0.85 = naturalna, zróżnicowana rozmowa
max_tokens: 400,      // musi być >= JSON wrapper + reply + extractedMemory
response_format: { type: "json_object" },
```

**Dlaczego 400 tokenów?** JSON wrapper + reply (max ~80 tokenów) + extractedMemory fields = ~150 tokenów. Przy 220 ryzyko ucięcia JSON-a w połowie.

## 5. Historia rozmowy

```ts
const formattedHistory = history
  .filter(m => m && typeof m.text === "string" && m.text.trim().length > 0)
  .slice(-12) // ostatnie 12 wiadomości = 6 wymian
  .map(m => ({
    role: m.sender === "companion" ? "assistant" : "user",
    content: m.text.trim(),
  }));
```

## 6. formatSentenceCapitalization — polskie znaki

```ts
// KRYTYCZNE: regex musi obejmować polskie litery
normalized = normalized.replace(
  /(^\s*|[.!?…]\s+)([a-ząćęłńóśźż])/gu,  // ← /gu flagi + polskie znaki
  (_, prefix, char) => prefix + char.toUpperCase()
);
```

## 7. Gramatyka żeńska — bezpieczne granice

```ts
// KRYTYCZNE: \b nie działa z polskimi znakami diakrytycznymi
// Używaj negative lookbehind/lookahead:
const regex = new RegExp(
  `(?<![a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ])${male}(?![a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ])`,
  "gi"
);
```

## 8. Protokół kryzysowy — kiedy aktywować

**TYLKO gdy user wprost:**
- mówi o myślach samobójczych
- opisuje bezpośrednie zagrożenie życia
- używa słów kluczowych: "chcę umrzeć", "nie chcę żyć", "skończyć z tym życiem"

**NIE aktywuj gdy:**
- user jest smutny, zmęczony, przybity
- user narzeka na problemy
- user jest zły lub sfrustrowany

**Numery:** 116 123 (kryzys 24/7), 112 (nagłe zagrożenie życia)

## 9. extractedMemory — kiedy wypełniać

```json
{
  "person": {
    "name": "Anna",
    "relation": "mama",
    "notes": "choruje na serce"
  }
}
```
Wypełniaj **tylko gdy user wspomniał nową osobę lub nowy fakt** o osobie już w systemie.
NIE wypełniaj gdy brak nowych informacji → `null`.
