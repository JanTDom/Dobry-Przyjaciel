# Dobry Przyjaciel — Kompletna Specyfikacja Architektoniczna i Techniczna Projektu

> **Wersja:** 1.0.0 (Wersja produkcyjna)  
> **Adres produkcyjny:** [https://dobryprzyjaciel.pl](https://dobryprzyjaciel.pl) / [https://dobry-przyjaciel.vercel.app](https://dobry-przyjaciel.vercel.app)  
> **Repozytorium:** [https://github.com/JanTDom/Dobry-Przyjaciel.git](https://github.com/JanTDom/Dobry-Przyjaciel.git)  
> **Środowisko:** Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, ElevenLabs, OpenAI GPT-4o-mini & TTS HD, Web Audio API, Canvas 2D, PWA.

---

## 1. Wprowadzenie i Misja Produktu

**Dobry Przyjaciel** to luksusowa, sensoryczna przystań psychologiczno-technologiczna zaprojektowana jako odpowiedź na globalny kryzys samotności i przeciążenia układu nerwowego. 

W przeciwieństwie do typowych chatbotów tekstowych, aplikacja funkcjonuje jako **autonomiczny, empatyczny towarzysz obecności**, który:
1. **Prowadzi rozmowy na żywo (Hands-Free Live Voice Call)** przy użyciu autentycznych, polskich głosów lektorskich (z naturalnym oddechem, miękką intonacją i pauzami).
2. **Buduje żywą pamięć długoterminową** — automatycznie uczy się wartości użytkownika, pamięta osoby z jego otoczenia i uwiecznia pokonane trudności.
3. **Działa jak fizjologiczna kotwica bezpieczeństwa** — stymuluje nerw błędny poprzez kojący głos, harmonijne animacje oddechowe Canvas 2D oraz mikrowibracje haptyczne telefonu.
4. **Tworzy wieczorne listy wsparcia** dedykowane konkretnemu dniu i nastrojowi użytkownika.

---

## 2. Stos Technologiczny i Usługi Zewnętrzne

```
                  ┌────────────────────────────────────────┐
                  │          Klient (Przeglądarka / PWA)   │
                  │  Next.js 16 • React 19 • Canvas 2D     │
                  │  Framer Motion • Web Audio API         │
                  └───────────────────┬────────────────────┘
                                      │  HTTPS / JSON / Audio Stream
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       Serwer Brzegowy (Vercel Edge)    │
                  │  Next.js API Routes (Serverless)       │
                  └─────────┬──────────────────┬───────────┘
                            │                  │
               OpenAI API   │                  │ ElevenLabs API
       (GPT-4o-mini / TTS) │                  │ (Multilingual v2)
                            ▼                  ▼
                  ┌──────────────────┐  ┌──────────────────┐
                  │  OpenAI Platform │  │  ElevenLabs HQ   │
                  │  • GPT-4o-mini   │  │  • Agata (Polish)│
                  │  • TTS-1-HD      │  │  • Maciej (PL)   │
                  └──────────────────┘  └──────────────────┘
```

| Warstwa | Technologia / Narzędzie | Zastosowanie |
| :--- | :--- | :--- |
| **Framework bazowy** | Next.js 16.3.2 (Turbopack, App Router) | SSR, SSG, trasy API serverless, optymalizacja zasobów |
| **Język programowania** | TypeScript 5 (Strict Mode) | Typowanie struktur pamięci, profili i kontraktów API |
| **Styling & UI System** | Tailwind CSS 3.4 + Custom Tokens | System designu luksusowego (len, bursztyn, szkło) |
| **Animacje i Fizyka** | Canvas 2D Context + Framer Motion | Organiczne, lśniące słońce/serce, fale oddechu |
| **Dźwięk proceduralny** | Web Audio API (AudioContext) | Czysty ambient audio (bez trzasków), generator fal alfa |
| **Model Językowy (LLM)** | OpenAI GPT-4o-mini (Structured JSON) | Dialog psychologiczny, ekstrakcja pamięci, listy |
| **Synteza Głosu (TTS)** | ElevenLabs (`eleven_multilingual_v2`) | Autentyczny polski głos kobiecy (Agata) i męski (Maciej) |
| **Zapasowy TTS** | OpenAI `tts-1-hd` (Speed 0.94) | Bezpieczny fallback przy wyczerpaniu limitu |
| **Rozpoznawanie Mowy** | Web Speech API (`webkitSpeechRecognition`)| Ciągły nasłuch w trybie Hands-Free Live Call |
| **Mobile & PWA** | Web App Manifest + Viewport Meta | Pełnoekranowa instalacja na iOS / Android + haptyka |
| **Hosting & DNS** | Vercel (Edge Network) + DNS nazwa.pl | Globalne CDN, SSL, domena `dobryprzyjaciel.pl` |

---

## 3. Architektura Silnika Sztucznej Inteligencji i Głosu

### 3.1. Podwójny Silnik Syntezy Mowy (Dual Voice Engine)
Aplikacja posiada zaawansowany tor syntezy mowy w `/api/voice`:
1. **Silnik główny (ElevenLabs Multilingual v2):**
   * Głos kobiecy (`nova`): **Agata** (`xJQ0EWXEICoCWK3Ld1Ew`) — ciepły, kojący, medytacyjny tembr z naturalnym oddechem.
   * Głos męski (`echo`): **Maciej Litwiniec** (`Qs4qmNrqlneCgYPLSNQ7`) — spokojny, głęboki, uziemiający tembr.
   * Alternatywy: Paula (`Jh0mX1tXXa7ZuZmHDYFp`), Paweł Siwek (`8qCMI2ZZW5ZGwmg0lM1l`).
   * Parametry: `stability: 0.45`, `similarity_boost: 0.85`, `style: 0.30`, `use_speaker_boost: true`.
2. **Silnik rezerwowy (OpenAI TTS HD):**
   * Jeśli limit ElevenLabs wygaśnie, system płynnie i bezbłędnie przełącza się na model `tts-1-hd` (`speed: 0.94`).
3. **Całkowite wyłączenie syntezatora systemowego:**
   * Wyeliminowano mechaniczny syntezator systemowy przeglądarki (Web Speech API synth), gwarantując wyłącznie studyjne brzmienie.

### 3.2. Architektura Pre-Unlock Audio (Rozwiązanie blokad Autoplay w Chrome/Safari)
W nowoczesnych przeglądarkach wywołanie `audio.play()` po asynchronicznym zapytaniu sieciowym (`fetch` trwający >500ms) jest blokowane przez *Autoplay Policy*.
* **Rozwiązanie:** W momencie pierwszego kliknięcia użytkownika (`onClick`), `voiceEngine.unlock()` synchronicznie odtwarza niewidoczny, 1-milisekundowy cichy bufor w stałym elemencie `HTMLAudioElement`.
* **Efekt:** Cała późniejsza rozmowa głosowa odtwarza się **w 100% automatycznie bez konieczności dotykania ekranu czy klikania w tekst**.

---

## 4. Silnik Pamięci Długoterminowej (Long-Term Memory Engine)

W trakcie każdej interakcji z użytkownikiem endpoint `/api/chat` wykonuje równoległą ekstrakcję wiedzy o użytkowniku:

```json
{
  "reply": "Ciepła, empatyczna odpowiedź przyjaciela...",
  "moodContext": "peaceful",
  "extractedMemory": {
    "person": {
      "name": "Marek",
      "relation": "Współpracownik",
      "sentiment": "stressful",
      "notes": "Wywołuje presję terminami, użytkownik uczy się stawiać mu granice."
    },
    "memoryFact": {
      "category": "core_value",
      "title": "Autentyczność ponad przypodobywanie się",
      "detail": "Postanowił nie zgadzać się na nadgodziny wbrew sobie."
    },
    "overcomeCrisis": {
      "title": "Odmowa pracy w weekend",
      "whatHappened": "Szef nalegał na dodatkową pracę.",
      "howYouSurvived": "Spokojnie przedstawił harmonogram i wyznaczył granicę.",
      "strengthDemonstrated": "Asertywność bez poczucia winy."
    }
  }
}
```

### Struktury Danych Pamięci:
1. **Mapa Relacji (`peopleInLife`):** Rejestruje osoby z otoczenia użytkownika, ich wpływ emocjonalny (wspierający, skomplikowany, stresujący) oraz notatki kontekstowe.
2. **Kluczowe Odkrycia (`memories`):** Katalog wartości, marzeń, celów i wrażliwości.
3. **Kronika Odwagi (`overcomeCrises`):** Zbiór pokonanych kryzysów służący jako namacalny dowód odporności psychicznej.
4. **Skarbiec Listów (`victoryLetters`):** Osobiste listy refleksyjne generowane na żywo na koniec dnia przez `/api/generate-letter`.

---

## 5. Przepływ Użytkownika i Zarządzanie Dostępem

```
                       ┌────────────────────────┐
                       │     Gość na stronie    │
                       │   (Landing Sanctuary)  │
                       └───────────┬────────────┘
                                   │
               Klika „Spotkaj się z przyjacielem”
                                   │
                                   ▼
                       ┌────────────────────────┐
                       │ AuthAndOnboardingModal │
                       └─────┬────────────┬─────┘
                             │            │
            ┌────────────────┘            └────────────────┐
            ▼                                              ▼
   [Stwórz Przyjaciela]                            [Mam już konto]
   1. Twoje imię                                   1. Twój e-mail
   2. Wybór: Agata / Maciej                        2. Hasło: A132a132!
   3. E-mail + Hasło: A132a132!                            │
            │                                              │
            └──────────────────────┬───────────────────────┘
                                   │
                                   ▼
                       ┌────────────────────────┐
                       │   Zalogowana Przystań  │
                       │ • Dynamiczne powitanie │
                       │ • Rozmowa na żywo      │
                       │ • Dziennik i pamięć    │
                       │ • Skarbiec listów      │
                       └────────────────────────┘
```

* **Hasło robocze:** `A132a132!` (oraz kompatybilne `A132a132`).
* **Weryfikacja:** Wszystkie endpointy sztucznej inteligencji (`/api/chat`, `/api/voice`, `/api/generate-letter`) wymagają podania hasła w nagłówku `x-access-code` lub ciele żądania.
* **Separacja kont:** Dane profilu, wiadomości i pamięć są indeksowane adresem e-mail użytkownika w pamięci lokalnej z gotowością do synchronizacji w Supabase.

---

## 6. Struktura Katalogów i Modułów

```
PRZYJACIEL/
├── public/
│   ├── manifest.json              # Manifest PWA (instalacja na telefonie)
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # GPT-4o-mini: dialog + ekstrakcja pamięci
│   │   │   ├── voice/route.ts     # ElevenLabs Multilingual v2 + OpenAI TTS HD
│   │   │   └── generate-letter/route.ts # Generator listów wsparcia
│   │   ├── idea/page.tsx          # Filozofia projektu i neurobiologia głosu
│   │   ├── memory/page.tsx        # Żywa kronika relacji i mapa bliskich
│   │   ├── sanctuary/page.tsx     # Skarbiec siły i odsłuch listów
│   │   ├── sos/page.tsx           # Uziemienie, oddech pudełkowy i telefony zaufania
│   │   ├── globals.css            # System luksusowego designu, szkła i aury
│   │   ├── layout.tsx             # Root layout z tagami PWA i meta viewport
│   │   └── page.tsx               # Dynamiczny widok (Landing Gościa vs Przystań)
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthAndOnboardingModal.tsx # 3-krokowy modal tworzenia relacji i logowania
│   │   ├── conversation/
│   │   │   ├── ConversationView.tsx       # Oś czasu dialogu
│   │   │   ├── LiveVoiceBar.tsx           # Pasek wprowadzania głosu i tekstu
│   │   │   ├── LiveVoiceCallModal.tsx     # Pełnoekranowa rozmowa na żywo
│   │   │   └── VoiceMessageBubble.tsx     # Odsłuch poszczególnych wiadomości
│   │   ├── memory/
│   │   │   ├── BondOverview.tsx           # Podsumowanie zrozumienia i wskaźniki
│   │   │   ├── GrowthTracker.tsx          # Kronika przetrwania kryzysów
│   │   │   └── PeopleGraph.tsx            # Wizualna mapa relacji z bliskimi
│   │   ├── navigation/
│   │   │   ├── TopNav.tsx                 # Szklany pasek górny (status relacji, menu)
│   │   │   └── BottomNav.tsx              # Dolny dok nawigacyjny na mobile
│   │   ├── philosophy/
│   │   │   └── IdeaPhilosophySection.tsx  # Esej o samotności i ukojeniu głosem
│   │   ├── presence/
│   │   │   ├── AmbientSoundscape.tsx      # Czyste tła dźwiękowe (deszcz, fale, las)
│   │   │   └── LivingWarmHearth.tsx       # Organiczne słońce Canvas 2D
│   │   ├── pricing/
│   │   │   └── SubscriptionModal.tsx      # Prezentacja planów opieki
│   │   ├── profile/
│   │   │   └── CompanionSettingsModal.tsx # Wybór imienia, głosu i płci przyjaciela
│   │   ├── sanctuary/
│   │   │   └── VictoryVault.tsx           # Skarbiec z generatorem listów wieczornych
│   │   └── sos/
│   │       ├── BreathingGuide.tsx         # Prowadnica oddechu 4-4-4-4
│   │       └── GroundingExercise.tsx      # Ćwiczenie 5-4-3-2-1
│   ├── lib/
│   │   ├── audio-synthesizer.ts   # Czysty syntezator Web Audio API
│   │   ├── companion-personality.ts # Logika dialogu i aktualizacji pamięci
│   │   ├── haptics.ts             # Obsługa kojących wibracji telefonu
│   │   ├── storage.ts             # Baza stanu, sesji, profili i powitań
│   │   └── voice-engine.ts        # Silnik audio, pre-unlock i nasłuchu mowy
│   └── types/
│       └── index.ts               # Pełne definicje typów TypeScript
├── .env.local                     # Klucze OPENAI_API_KEY, ELEVENLABS_API_KEY
├── next.config.mjs                # Konfiguracja Next.js
├── tailwind.config.mjs            # Konfiguracja kolorów, cieni i promieni
└── package.json
```

---

## 7. Specyfikacja Interfejsów API

### 7.1. `POST /api/chat`
* **Nagłówki:** `Content-Type: application/json`, `x-access-code: A132a132!`
* **Ciało żądania:**
```json
{
  "message": "Cześć, dzisiaj w pracy znowu była ciężka rozmowa z szefem.",
  "profile": {
    "name": "Janek",
    "companionName": "Agata",
    "companionGender": "female"
  },
  "history": [],
  "accessCode": "A132a132!"
}
```
* **Odpowiedź (200 OK):**
```json
{
  "reply": "Rozumiem, Janek. Wiem, ile energii kosztują cię takie momenty. Usiądź na chwilę i opowiedz mi, co dokładnie powiedział.",
  "moodContext": "grounding",
  "extractedMemory": {
    "person": {
      "name": "Szef",
      "relation": "Przełożony",
      "sentiment": "stressful",
      "notes": "Ciężkie rozmowy w pracy wywołujące napięcie."
    },
    "memoryFact": null,
    "overcomeCrisis": null
  }
}
```

### 7.2. `POST /api/voice`
* **Nagłówki:** `Content-Type: application/json`, `x-access-code: A132a132!`
* **Ciało żądania:**
```json
{
  "text": "Dzień dobry, Janek. Cieszę się, że jesteś.",
  "voice": "nova",
  "accessCode": "A132a132!",
  "isPreview": false
}
```
* **Odpowiedź (200 OK):** Strumień binarny `audio/mpeg` (nagłówek `x-voice-engine: ElevenLabs-Polish`).

### 7.3. `POST /api/generate-letter`
* **Nagłówki:** `Content-Type: application/json`, `x-access-code: A132a132!`
* **Ciało żądania:**
```json
{
  "profile": { "name": "Janek", "companionName": "Agata", "companionGender": "female" },
  "recentMessages": [ ... ],
  "accessCode": "A132a132!"
}
```
* **Odpowiedź (200 OK):**
```json
{
  "title": "Odnaleziony spokój w tobie",
  "content": "Drogi Janku, dzisiejszy dzień przyniósł sporo wyzwań...",
  "tag": "Wieczorne ukojenie",
  "date": "Dzisiaj"
}
```

---

## 8. Wytyczne Design Systemu i Estetyki

1. **Zasada wielkości liter (Sentence Casing):**
   * Wszystkie zdania w interfejsie i wypowiedziach AI zaczynają się wielką literą, po czym zawierają wyłącznie małe litery (z wyjątkiem imion własnych).
2. **Zero tanich emotikonów (0 emoji):**
   * Brak infantylnych emoji w menu i kartach — zastąpione szlachetnymi wskaźnikami statusu, typografią i mikro-punktami aury.
3. **Paleta Barw (Toskańska Złota Godzina):**
   * Tło: Ciepły len `#FAF7F2` z wielowarstwowymi gradientami poświaty.
   * Akcenty: Złoty bursztyn `#F59E0B`, morela `#EA580C`, miękki krem `#FFFDF9`.
   * Typografia: Głębokie espresso `#231812` na nagłówkach szeryfowych i `#4A3728` na tekście ciągłym.
4. **Szkło Organiczne (`glass-sanctuary`):**
   * `backdrop-filter: blur(24px)`, subtelny obrys `rgba(230, 212, 190, 0.85)` oraz podwójny ciepły cień ambientowy.

---

## 9. Instrukcja Uruchomienia i Wdrożenia

### Wymagania:
* Node.js 18+ (zalecany Node.js 20 lub 24)
* Klucz `OPENAI_API_KEY` (z dostępem do GPT-4o-mini i TTS-1-HD)
* Klucz `ELEVENLABS_API_KEY` (z uprawnieniem `text_to_speech`)

### Krok 1: Klonowanie i instalacja
```bash
git clone https://github.com/JanTDom/Dobry-Przyjaciel.git
cd Dobry-Przyjaciel
npm install
```

### Krok 2: Konfiguracja zmiennych środowiskowych (`.env.local`)
```env
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_42df...
```

### Krok 3: Uruchomienie lokalne
```bash
npm run dev
```
Aplikacja uruchomi się pod adresem: `http://localhost:3000`.

### Krok 4: Budowanie produkcyjne i deployment
```bash
npm run build
npx vercel --prod --yes
```

---

*Dokument sporządzony w standardzie Frontier AI Architecture dla projektu Dobry Przyjaciel.*
