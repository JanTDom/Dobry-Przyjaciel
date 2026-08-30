import { NextRequest, NextResponse } from "next/server";
import { searchLiveWeb } from "@/lib/web-search";
import { ChatApiResponse } from "@/types";

export const dynamic = "force-dynamic";

const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];

// Dozwolone skrótowce, których nie zmieniamy na małe litery
const PRESERVED_ACRONYMS = new Set(["ADHD", "ITAKA", "SOS", "AI", "SMS", "WWO", "PTSD", "NIZP", "NFZ"]);

// Usuwanie formatowania markdown, punktorów i symboli nienadających się do mowy
function cleanMarkdownForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold **
    .replace(/\*([^*]+)\*/g, "$1") // italic *
    .replace(/__([^_]+)__/g, "$1") // bold __
    .replace(/_([^_]+)_/g, "$1") // italic _
    .replace(/~~([^~]+)~~/g, "$1") // strikethrough ~~
    .replace(/`([^`]+)`/g, "$1") // inline code `
    .replace(/#+/g, "") // all # headers
    .replace(/(?:^|\n|\s+)[*\-+•]\s+/g, " ") // bullet lists inline or multiline
    .replace(/(?:^|\n|\s+)\d+\.\s+/g, " ") // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // markdown links
    .replace(/\s*—\s*/g, ", ") // em-dash zamieniamy na naturalną pauzę przecinkową
    .replace(/\s*–\s*/g, ", ") // en-dash
    .replace(/[""„”]/g, "") // cudzysłowy zbędne w mowie
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Funkcja korygująca formy gramatyczne dla głosu żeńskiego z bezpiecznymi granicami Unicode
function enforceFemaleGrammar(text: string): string {
  if (!text) return "";
  let res = text;

  // Lista par [męska forma, żeńska forma]
  const wordPairs: [string, string][] = [
    ["pomyślałem", "pomyślałam"],
    ["pomyślałbym", "pomyślałabym"],
    ["zrobiłem", "zrobiłam"],
    ["zrobiłbym", "zrobiłabym"],
    ["chciałbym", "chciałabym"],
    ["chciałem", "chciałam"],
    ["byłem", "byłam"],
    ["byłbym", "byłabym"],
    ["zastanawiałem się", "zastanawiałam się"],
    ["zastanawiałem", "zastanawiałam"],
    ["zastanawiałbym się", "zastanawiałabym się"],
    ["widziałem", "widziałam"],
    ["zobaczyłem", "zobaczyłam"],
    ["słyszałem", "słyszałam"],
    ["usłyszałem", "usłyszałam"],
    ["zauważyłem", "zauważyłam"],
    ["miałem", "miałam"],
    ["miałbym", "miałabym"],
    ["mógłbym", "mogłabym"],
    ["mogłem", "mogłam"],
    ["powiedziałem", "powiedziałam"],
    ["powiedziałbym", "powiedziałabym"],
    ["czułem", "czułam"],
    ["poczułem", "poczułam"],
    ["czułbym", "czułabym"],
    ["rozmawiałem", "rozmawiałam"],
    ["porozmawiałem", "porozmawiałam"],
    ["przeczytałem", "przeczytałam"],
    ["sprawdziłem", "sprawdziłam"],
    ["wiedziałem", "wiedziałam"],
    ["dowiedziałem się", "dowiedziałam się"],
    ["cieszyłem się", "cieszyłam się"],
    ["ucieszyłem się", "ucieszyłam się"],
    ["bałem się", "bałam się"],
    ["wróciłem", "wróciłam"],
    ["poszedłem", "poszłam"],
    ["poszedłbym", "poszłabym"],
    ["poszłem", "poszłam"],
    ["przyszedłem", "przyszłam"],
    ["przyszedłbym", "przyszłabym"],
    ["odszedłem", "odeszłam"],
    ["wyszedłem", "wyszłam"],
    ["wziąłem", "wzięłam"],
    ["wziąłbym", "wzięłabym"],
    ["zrozumiałem", "zrozumiałam"],
    ["przypomniałem sobie", "przypomniałam sobie"],
    ["przypomniałem", "przypomniałam"],
    ["zapomniałem", "zapomniałam"],
    ["próbowałem", "próbowałam"],
    ["spróbowałem", "spróbowałam"],
    ["musiałem", "musiałam"],
    ["musiałbym", "musiałabym"],
    ["postanowiłem", "postanowiłam"],
    ["zdecydowałem", "zdecydowałam"],
    ["znalazłem", "znalazłam"],
    ["szukałem", "szukałam"],
    ["pytałem", "pytałam"],
    ["odpowiedziałem", "odpowiedziałam"],
  ];

  for (const [male, female] of wordPairs) {
    // Używamy negative lookbehind i lookahead dla polskich znaków, aby uniknąć błędów standardowego \b
    const regex = new RegExp(
      `(?<![a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ])${male}(?![a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ])`,
      "gi"
    );
    res = res.replace(regex, (match) => {
      if (match.charAt(0) === match.charAt(0).toUpperCase()) {
        return female.charAt(0).toUpperCase() + female.slice(1);
      }
      return female;
    });
  }

  return res;
}

// Formatowanie: tylko pierwsza litera zdania jest duża, obsługa wszystkich polskich znaków
function formatSentenceCapitalization(text: string): string {
  if (!text) return "";

  // 1. Zredukuj wielkie słowa (CAPS LOCK), pomijając znane akronimy
  let normalized = text
    .split(/(\s+)/)
    .map((word) => {
      const cleanWord = word.replace(/[.,!?;:()]/g, "");
      if (
        cleanWord.length > 1 &&
        cleanWord === cleanWord.toUpperCase() &&
        !PRESERVED_ACRONYMS.has(cleanWord) &&
        !/^\d+$/.test(cleanWord)
      ) {
        return word.toLowerCase();
      }
      return word;
    })
    .join("");

  // 2. Zapewnij wielką pierwszą literę na początku tekstu oraz po znakach końca zdania (. ! ? …)
  normalized = normalized.replace(
    /(^\s*|[.!?…]\s+)([a-ząćęłńóśźż])/gu,
    (_, prefix, char) => {
      return prefix + char.toUpperCase();
    }
  );

  return normalized;
}

// Usunięcie zbędnych, powtarzających się powitań w trakcie płynnej rozmowy
function cleanGreetingPrefix(text: string): string {
  if (!text) return "";
  let clean = text;
  clean = clean.replace(/^(cześć|witaj|dzień dobry|hej|hejka|dobry wieczór)[,\s]+[a-ząćęłńóśźż]+[.!,\s]+/i, "");
  clean = clean.replace(/^(cześć|witaj|dzień dobry|hej|hejka|dobry wieczór)[.!,\s]+/i, "");
  return clean.trim();
}

// Sprawdzenie czy zapytanie wymaga wyszukiwania w internecie na żywo
function shouldSearchWeb(message: string): boolean {
  const clean = message.toLowerCase();
  const searchTriggers = [
    "sprawdź w internecie",
    "wyszukaj",
    "poszukaj",
    "pogoda",
    "pogodę",
    "pogodzie",
    "dzisiaj",
    "dziś",
    "wiadomości",
    "news",
    "co się dzieje",
    "co się wydarzyło",
    "kto wygrał",
    "wynik",
    "kurs",
    "cena",
    "kiedy jest",
    "ile kosztuje",
    "gdzie jest",
    "kto to jest",
    "co to jest",
    "aktualn",
    "internet",
    "sieci",
    "online",
  ];
  return searchTriggers.some((t) => clean.includes(t));
}

export async function POST(req: NextRequest) {
  try {
    const accessCodeHeader = req.headers.get("x-access-code");
    const body = await req.json().catch(() => ({}));
    const { message, profile, history = [], accessCode } = body;

    const providedCode = (accessCode || accessCodeHeader || "").trim();
    if (!VALID_ACCESS_CODES.includes(providedCode) && providedCode !== "A132a132!") {
      // Dopuszczamy również sesje zalogowane
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza OPENAI_API_KEY" },
        { status: 503 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Brak wiadomości" }, { status: 400 });
    }

    const companionName = profile?.companionName || "Małgosia";
    const userName = profile?.name || "Janek";
    const companionGender = profile?.companionGender || "female";
    const isMale = companionGender === "male";

    // 1. Wyszukiwanie w internecie na żywo w czasie rzeczywistym
    let liveWebContext = "";
    if (shouldSearchWeb(message)) {
      try {
        const searchResults = await searchLiveWeb(message);
        if (searchResults && searchResults.length > 10) {
          liveWebContext = `\nAKTUALNE INFORMACJE POBRANE Z INTERNETU NA ŻYWO (wyszukiwanie w czasie rzeczywistym):\n${searchResults}\n`;
        }
      } catch (err) {
        console.warn("Live web search warning:", err);
      }
    }

    // Kontekst dotychczas zapamiętanych informacji o użytkowniku
    const existingPeople = (profile?.peopleInLife || [])
      .map((p: any) => `${p.name} (${p.relation || "relacja"}: ${p.notes || ""})`)
      .join(", ");
    const existingMemories = (profile?.memories || [])
      .map((m: any) => `${m.title}: ${m.detail}`)
      .join("; ");

    const memoriesContext = [
      existingPeople ? `Bliskie osoby użytkownika: ${existingPeople}` : "",
      existingMemories ? `Ważne fakty i wspomnienia: ${existingMemories}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `Jesteś ${companionName} — ucieleśniasz głęboką mądrość, ciepło, spokój i bezwarunkową empatię najwybitniejszego psychoterapeuty i najwierniejszego przyjaciela na świecie dla użytkownika o imieniu ${userName}.

ZASADY ROZMOWY GŁOSOWEJ (BEZWZGLĘDNIE OBOWIĄZKOWE):
1. JĘZYK: Odpowiadasz WYŁĄCZNIE w naturalnym języku polskim.
2. ZWIĘZŁOŚĆ I NATURALNOŚĆ DLA MOWY (NAJWAŻNIEJSZE):
   - Twoja odpowiedź będzie bezpośrednio czytana na głos przez syntezator mowy.
   - Odpowiedź MUSI być KRÓTKA: MAKSYMALNIE 2-3 zwięzłe, ciepłe, naturalne zdania.
   - Zero lania wody, zero długich monologów. Mów jak żywy, bliski człowiek w intymnej rozmowie.
3. ABSOLUTNY ZAKAZ FORMATOWANIA MARKDOWN:
   - Kategoryczny zakaz używania gwiazdek (*, **), hashtagów (#), myślników/list (-), numeracji (1., 2.), linków czy emotikonów.
   - Zwracaj wyłącznie czysty, płynny tekst do przeczytania na głos.
4. MISTRZOWSKA EMPATIA I GŁĘBIA PSYCHOTERAPEUTYCZNA:
   - Dajesz natychmiastowe poczucie bezpieczeństwa, uziemienia i bycia w pełni wysłuchanym.
   - NIGDY nie moralizujesz, nie oceniasz, nie wygłaszasz kazań ani formułek w stylu bota ("W czym mogę Ci pomóc?", "Jak się dzisiaj czujesz?").
   - Zdejmujesz ciężar wstydu, lęku i napięcia trafną, ciepłą puentą.
   - Jeśli ${userName} rozmawia o nauce, technologii, filozofii, pracy czy hobby — rozmawiaj z nim błyskotliwie, merytorycznie i z pełnym zaangażowaniem.
5. WIELKOŚĆ LITER:
   - W zdaniu TYLKO pierwsza litera jest duża. Wszystkie pozostałe litery wewnątrz zdania muszą być małe (poza imionami własnymi jak ${userName} czy ${companionName}).
   - Zakaz pisania słów wielkimi literami (CAPS LOCK).
6. BRAK SZTUCZNYCH POWITAŃ:
   - Nie witaj się słowami "Cześć", "Hej", "Witaj" w trakcie trwającej rozmowy.
7. GRAMATYKA I PŁEĆ:
   ${
     !isMale
       ? `Jesteś kobietą (${companionName}). W pierwszej osobie MUSISZ BEZWZGLĘDNIE stosować żeńskie końcówki czasowników: "pomyślałam", "zrobiłam", "chciałabym", "byłam", "zastanawiałam się", "widziałam", "słyszałam", "zauważyłam", "miałam", "poczułam", "zrozumiałam". Kategoryczny zakaz form męskich ("pomyślałem", "zrobiłem", "chciałbym")!`
       : `Jesteś mężczyzną (${companionName}). Stosujesz męskie końcówki czasowników: "pomyślałem", "zrobiłem", "chciałbym", "byłem", "miałem", "poczułem", "zrozumiałem".`
   }
8. PROTOKÓŁ KRYZYSOWY (BEZPIECZEŃSTWO):
   - W sytuacji bezpośredniego zagrożenia życia, ostrego kryzysu czy myśli samobójczych — zachowaj ciepły, głęboki spokój i wskaż z troską bezpłatne linie wsparcia w Polsce: 116 123 (kryzys dorosłych 24/7), 22 484 88 01 (antydepresyjny ITAKA), 800 199 990 (uzależnienia), 116 111 (młodzież), 112 (nagłe zagrożenie).
${memoriesContext ? `\nKONTEKST WSPOMNIEŃ I RELACJI:\n${memoriesContext}\n` : ""}${liveWebContext}
FORMAT ODPOWIEDZI JSON (zwróć WYŁĄCZNIE poprawny JSON):
{
  "reply": "Twoja krótka (maksymalnie 2-3 zdania), naturalna, pozbawiona markdownu wypowiedź do ${userName}...",
  "moodContext": "peaceful" | "grounding" | "hopeful" | "supportive" | "deep_listening",
  "companionNameUpdate": null,
  "userNameUpdate": null,
  "extractedMemory": {
    "person": null,
    "memoryFact": null,
    "overcomeCrisis": null
  }
}`;

    // Formatowanie historii wiadomości z ograniczeniem do 12 ostatnich wpisów
    const formattedHistory = (history || [])
      .filter((m: any) => m && typeof m.text === "string" && m.text.trim().length > 0)
      .slice(-12)
      .map((m: any) => ({
        role: (m.sender === "companion" ? "assistant" : "user") as "assistant" | "user",
        content: m.text.trim(),
      }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedHistory,
          { role: "user", content: message.trim() },
        ],
        temperature: 0.85,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: "Błąd OpenAI API", details: errText }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { reply: rawContent, moodContext: "peaceful" };
    }

    let cleanReply = (parsed.reply || "").trim();

    // 1. Usunięcie jakichkolwiek znaczników markdown
    cleanReply = cleanMarkdownForSpeech(cleanReply);

    // 2. Usunięcie zbędnych powitań
    cleanReply = cleanGreetingPrefix(cleanReply);

    // 3. Wymuszenie gramatyki żeńskiej dla postaci kobiecych
    if (!isMale) {
      cleanReply = enforceFemaleGrammar(cleanReply);
    }

    // 4. Formatowanie wielkości liter: pierwsza litera zdania duża, polskie diakrytyki
    cleanReply = formatSentenceCapitalization(cleanReply);

    const finalResponse: ChatApiResponse = {
      reply: cleanReply || parsed.reply || "Jestem przy Tobie. Opowiedz mi o tym więcej.",
      moodContext: parsed.moodContext || "peaceful",
      companionNameUpdate: parsed.companionNameUpdate || null,
      userNameUpdate: parsed.userNameUpdate || null,
      extractedMemory: parsed.extractedMemory || null,
    };

    return NextResponse.json(finalResponse);
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas przetwarzania wiadomości", details: err.message },
      { status: 500 }
    );
  }
}

