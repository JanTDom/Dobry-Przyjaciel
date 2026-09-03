---
name: dobry-przyjaciel-codebase
description: >-
  Mapa całej architektury aplikacji Dobry Przyjaciel. Aktywuj jako PIERWSZE
  przy każdym nowym zadaniu — daje pełny kontekst struktury plików, stacku,
  kluczowych komponentów i wzorców używanych w projekcie.
---

# Dobry Przyjaciel — Mapa Kodu

## Stack
- **Next.js 16.3.2** (App Router, Turbopack dev, TypeScript 7, React 19)
- **Tailwind CSS 3.4**, Framer Motion 13, Lucide React
- **AI:** OpenAI GPT-4o-mini (chat), Whisper (STT), ElevenLabs Multilingual v2 (TTS)
- **DB:** Supabase (PostgreSQL), localStorage (offline fallback)
- **Deploy:** Vercel prod → `https://dobryprzyjaciel.pl`

---

## Struktura plików

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, viewport (viewport-fit=cover!)
│   ├── globals.css             # Tailwind, CSS vars, safe-area utilities (.pb-safe etc.)
│   ├── page.tsx                # Strona główna — otwiera LiveVoiceCallModal
│   ├── idea/page.tsx           # Filozofia produktu
│   ├── memory/page.tsx         # Pamięć i więź
│   ├── sanctuary/page.tsx      # Listy / schronienie
│   ├── sos/page.tsx            # Ukojenie / kryzys
│   └── api/
│       ├── chat/route.ts       # ← NAJWAŻNIEJSZY: GPT-4o-mini, system prompt
│       ├── voice/route.ts      # ElevenLabs TTS (mp3_44100_128)
│       ├── transcribe/route.ts # Whisper STT (mp4/webm)
│       └── generate-letter/route.ts
│
├── lib/
│   ├── voice-engine.ts         # ← NAJWAŻNIEJSZY: cały audio pipeline iOS
│   ├── companion-personality.ts # getCompanionReplyAsync(), ekstrakcja pamięci
│   ├── storage.ts              # localStorage: messages, profile (SSR-safe)
│   ├── supabase.ts             # Supabase client
│   ├── audio-synthesizer.ts    # Pomocniczy synthesizer
│   ├── haptics.ts              # Haptyczne wibracje
│   └── web-search.ts           # Live web search (dla aktualnych info)
│
├── components/
│   ├── conversation/
│   │   ├── LiveVoiceCallModal.tsx  # ← Kluczowy: modal rozmowy głosowej
│   │   ├── LiveVoiceBar.tsx        # Pasek tekstowej rozmowy
│   │   ├── ConversationView.tsx    # Widok historii rozmowy
│   │   └── VoiceMessageBubble.tsx  # Bąbel wiadomości
│   ├── navigation/
│   │   ├── TopNav.tsx              # Górna nawigacja (pt-safe dla notcha)
│   │   └── BottomNav.tsx           # Dolna nawigacja (pb-safe-nav dla home bara)
│   ├── presence/
│   │   ├── LivingPresenceOrb.tsx   # Animowany orb obecności AI
│   │   ├── LivingWarmHearth.tsx    # Animacja ogniska
│   │   ├── AmbientSoundscape.tsx   # Ambient dźwięki
│   │   └── MoodAtmosphere.tsx      # Atmosfera nastroju
│   ├── home/
│   │   ├── EmotionalWeatherSelector.tsx # Wybór nastroju
│   │   └── VoiceAuditionStudio.tsx      # Wybór głosu companion
│   ├── auth/
│   │   ├── AccessGateModal.tsx     # Kod dostępu: "A132a132!"
│   │   └── AuthAndOnboardingModal.tsx
│   ├── profile/
│   │   └── CompanionSettingsModal.tsx # Ustawienia: imię, głos, płeć
│   ├── memory/
│   │   ├── BondOverview.tsx        # Przegląd więzi
│   │   ├── GrowthTracker.tsx       # Śledzenie wzrostu
│   │   └── PeopleGraph.tsx         # Graf osób
│   ├── sanctuary/
│   │   └── VictoryVault.tsx        # Skarbiec zwycięstw
│   ├── sos/
│   │   ├── BreathingGuide.tsx      # Ćwiczenie oddechu
│   │   └── GroundingExercise.tsx   # Uziemienie
│   ├── pricing/
│   │   └── SubscriptionModal.tsx
│   └── footer/
│       └── SiteFooter.tsx
│
└── types/
    └── index.ts                # Wszystkie typy: UserProfile, Message, ChatApiResponse etc.
```

---

## Kluczowe wzorce

### 1. Otwieranie rozmowy głosowej (krytyczna kolejność!)
```ts
// page.tsx / sos/page.tsx / idea/page.tsx
const handleOpenLiveCall = async () => {
  await voiceEngine.unlock(); // ← PRZED setState (iOS gesture chain)
  setIsLiveCallOpen(true);
  // NIE wywołuj voiceEngine.startLiveDialogue() tutaj!
};
```

### 2. Singleton voiceEngine
```ts
// src/lib/voice-engine.ts — eksportowany singleton
export const voiceEngine = new VoiceEngine();
// Importuj wszędzie: import { voiceEngine } from "@/lib/voice-engine";
```

### 3. UserProfile
```ts
interface UserProfile {
  name: string;              // imię użytkownika
  companionName: string;     // imię AI (domyślnie "Małgosia")
  companionGender: "female" | "male" | "neutral";
  companionVoice: string;    // ElevenLabs voice ID
  memories: Memory[];
  peopleInLife: Person[];
  // ...
}
```

### 4. Kod dostępu
```ts
const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];
```

### 5. Głosy ElevenLabs
```ts
// Female: "xJQ0EWXEICoCWK3Ld1Ew" (Agata)
// Male: "8qCMI2ZZW5ZGwmg0lM1l" (Paweł Siwek)
```

---

## CSS — ważne klasy
```css
.pb-safe      /* padding-bottom: env(safe-area-inset-bottom) — dla home bar */
.pt-safe      /* padding-top: env(safe-area-inset-top) — dla notcha */
.pb-safe-nav  /* padding-bottom: max(1rem, 0.75rem + safe-area) — dla BottomNav */
.gpu-layer    /* transform: translateZ(0); will-change: transform; */
```

## Tailwind custom tokens (tailwind.config.*)
```
bg-paper, bg-paper-dark
text-ink, text-ink-muted, text-ink-subtle
border-warm-amber, bg-warm-amber, text-warm-amber
shadow-quiet-sm, shadow-quiet-md, shadow-quiet-lg
```
