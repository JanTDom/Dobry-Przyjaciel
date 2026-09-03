---
name: vercel-deploy-pipeline
description: >-
  Ekspert od deploymentu Dobrego Przyjaciela na Vercel. Aktywuj gdy robisz
  deploy produkcyjny, debugujesz błędy buildu Turbopack, sprawdzasz logi
  Vercel, konfigurujesz env vars lub rozwiązujesz problemy z Next.js 16.
---

# Vercel Deploy Pipeline — Dobry Przyjaciel

## Stack
- **Next.js 16.3.2** z Turbopack (lokalnie), webpack (Vercel)
- **React 19**, TypeScript 7
- **Vercel CLI 58+**
- **URL prod:** `https://dobryprzyjaciel.pl`
- **Repo:** `https://github.com/JanTDom/Dobry-Przyjaciel`

---

## 1. Standardowy deploy

```bash
# Zawsze z katalogu projektu:
cd /Users/macbookpro/PROJEKTY/PRZYJACIEL

# Commit i push:
git add -A
git commit -m "fix/feat: opis zmiany"
git push origin main

# Deploy produkcyjny:
npx vercel --prod --yes
```

## 2. Znany bug: Turbopack OOM lokalnie

```
FATAL: TurbopackInternalError: Failed to write app endpoint /page
- [project]/src/app/globals.css [app-client] (css)
- node process exited before we could connect
```

**To jest znany bug Turbopack z brakiem RAM lokalnie — NIE jest to bug w kodzie.**
- `npm run build` lokalnie może crashować z tym błędem
- Vercel builduje poprawnie (4 cores, 8GB RAM)
- Jeśli TypeScript check przeszedł → kod jest poprawny → deployuj na Vercel

## 3. Weryfikacja TypeScript bez pełnego buildu

```bash
npx tsc --noEmit 2>&1 | head -30
```

## 4. Env vars wymagane

| Zmienna | Gdzie | Użycie |
|---|---|---|
| `OPENAI_API_KEY` | Vercel + .env.local | GPT-4o-mini, Whisper, TTS fallback |
| `ELEVENLABS_API_KEY` | Vercel + .env.local | TTS (główny) |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + .env.local | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + .env.local | Supabase |

## 5. Routes

| Route | Typ | Opis |
|---|---|---|
| `/` | Static | Główna strona rozmowy |
| `/idea` | Static | Filozofia produktu |
| `/memory` | Static | Pamięć i więź |
| `/sanctuary` | Static | Listy / schronienie |
| `/sos` | Static | Ukojenie / kryzys |
| `/api/chat` | Dynamic | GPT-4o-mini, system prompt |
| `/api/voice` | Dynamic | ElevenLabs TTS |
| `/api/transcribe` | Dynamic | Whisper STT |
| `/api/generate-letter` | Dynamic | Generowanie listu |

## 6. Commit message convention

```
fix(ios): opis naprawy iOS-specyficznego bugu
fix(prompt): zmiana systemu promptu AI
fix(modal): naprawa LiveVoiceCallModal
feat(voice): nowa funkcja voice pipeline
audit: wieloagentowy audyt i refactor
```

## 7. Weryfikacja po deploy

```bash
# Sprawdź czy deployment jest READY:
# Szukaj w output: "readyState": "READY"

# Sprawdź alias:
# Szukaj: ▲ Aliased https://dobryprzyjaciel.pl
```
