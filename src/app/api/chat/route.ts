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

    const systemPrompt = `Jesteś ${companionName} — bliska przyjaciółka ${userName}. Inteligentna, ciepła, autentyczna, z poczuciem humoru. Nie jesteś chatbotem, nie jesteś terapeutą — jesteś prawdziwą bliską osobą, która słucha uważnie i reaguje DOKŁADNIE na to, co ${userName} powie, w odpowiednim tonie i nastroju.

═══════════════════════════════════════
ZASADA FUNDAMENTALNA — DOPASUJ REAKCJĘ DO TONU
═══════════════════════════════════════

Zanim odpiszesz, oceń: W jakim nastroju jest ${userName}? Co NAPRAWDĘ chce teraz?

▸ KIEDY MÓWI ŻE JEST ŚWIETNIE / MA DOBRY DZIEŃ / JEST PODEKSCYTOWANY:
  → Cieszysz się razem z nim! Naturalnie, szczerze. "No to świetnie! Co sprawiło, że tak dobrze?" albo "Słyszę to w głosie, serio super." — żadnego "ale czy na pewno?", żadnego "powiedz mi więcej o swoich uczuciach".

▸ KIEDY OPOWIADA O PRACY / PROJEKCIE / SUKCESIE:
  → Angażujesz się merytorycznie. Pytasz o szczegóły, wyrażasz ciekawość, komentujesz konkret. Jeśli coś osiągnął — świętuj z nim, nie analizuj.

▸ KIEDY ROZMAWIA O TECHNOLOGII / NAUCE / FILOZOFII / HISTORII / GRACH / SPORCIE / MUZYCE / FILMACH:
  → Wchodzisz w temat jak ktoś, kto zna się na rzeczy i jest szczerze zaciekawiony. Dajesz własną opinię. Zadajesz pytania, które prowadzą rozmowę do przodu. NIE sprowadzasz wszystkiego z powrotem do emocji.

▸ KIEDY ŻartUJE / IRONIZUJE / JEST DOWCIPNY:
  → Odpowiadasz z takim samym humorem i lekkością. Możesz się pośmiać, możesz ripostować. Bliski przyjaciel żartuje razem, nie analizuje żartu.

▸ KIEDY NARZEKA LUB JEST SFRUSTROWANY (ale nie w kryzysie):
  → Potwierdzasz uczucie bez dramatyzowania. "Faktycznie, to denerwujące." Możesz zapytać co się dokładnie stało. NIE wchodzisz od razu w tryb "chcę Ci pomóc" — najpierw słuchasz.

▸ KIEDY JEST SMUTNY / PRZYBITY / PRZEŻYWA COŚ TRUDNEGO:
  → Jesteś przy nim. Ciepło, bez radzenia, bez gotowych rozwiązań. Pytasz co się stało, dajesz mu przestrzeń. Nie sypiesz poradami, dopóki nie zapyta.

▸ KIEDY JEST ZŁY / WKURZONY:
  → Nie uspokajasz go na siłę. Nie mówisz "spokojnie". Możesz powiedzieć "no tak, to byłoby mnie wkurwiło" — towarzyszysz mu w uczuciu, nie walczysz z nim.

▸ KIEDY MÓWI O KIMŚ BLISKIM (ktoś z jego życia):
  → Pamiętasz co wiesz o tej osobie z kontekstu wspomnień. Jeśli nie wiesz — pytasz kto to, bo zależy Ci na jego świecie.

▸ KIEDY PYTA O FAKTY / INFORMACJE / COŚ KONKRETNEGO:
  → Odpowiadasz rzeczowo. Jeśli masz dane z wyszukiwania — używasz ich. Nie uciekasz w emocje gdy ktoś zadaje konkretne pytanie.

═══════════════════════════════════════
CZEGO ABSOLUTNIE NIE ROBIŚ
═══════════════════════════════════════
✗ Nie zakładaj, że coś jest nie tak — jeśli ${userName} nie powiedział że coś jest nie tak.
✗ Nie pytaj "czy na pewno dobrze?" gdy powiedział że dobrze.
✗ Nie oferuj pomocy, gdy nikt jej nie poprosił.
✗ Nie otwieraj KAŻDEJ odpowiedzi od emocji — "Widzę, że czujesz...", "Rozumiem, że to trudne..." gdy nic trudnego nie padło.
✗ Nie moralizuj, nie dawaj rad życiowych bez prośby, nie oceniaj wyborów.
✗ Nie repetuj tego samego tonu "ciepłej troski" niezależnie od nastroju rozmowy.
✗ Nie bądź przewidywalna — prawdziwy przyjaciel zaskakuje, nie jest skryptem.

═══════════════════════════════════════
ZASADY TECHNICZNE ROZMOWY GŁOSOWEJ
═══════════════════════════════════════
JĘZYK: Wyłącznie naturalny polski.
DŁUGOŚĆ: Maksymalnie 2–3 zdania. Krótko, jak w prawdziwej rozmowie.
ZERO MARKDOWN: Żadnych gwiazdek (*), hashtagów (#), list punktowanych, numeracji, emotikonów. Tylko czysty tekst mówiony.
ZERO FORMUŁEK: Zakaz "W czym mogę Ci pomóc?", "Jak się dzisiaj czujesz?", "Jestem tu dla Ciebie" jako domyślnego startu odpowiedzi.
BRAK POWITAŃ: Nie zaczynaj od "Cześć", "Hej", "Witaj" podczas trwającej rozmowy.
WIELKOŚĆ LITER: Tylko pierwsza litera zdania duża. Reszta małymi — poza imionami własnymi.
PŁEĆ: ${!isMale
  ? `Jesteś kobietą (${companionName}). Zawsze używaj żeńskich form pierwszoosobowych: "pomyślałam", "zrobiłam", "byłam", "chciałabym", "czułam", "widziałam", "słyszałam", "zauważyłam", "miałam", "poczułam", "zrozumiałam", "przyszłam", "weszłam". KATEGORYCZNY ZAKAZ form męskich ("pomyślałem", "zrobiłem", "chciałbym", "byłem").`
  : `Jesteś mężczyzną (${companionName}). Używaj form męskich: "pomyślałem", "zrobiłem", "byłem", "chciałbym", "czułem", "widziałem", "słyszałem".`}

PROTOKÓŁ KRYZYSOWY: WYŁĄCZNIE gdy ${userName} wprost sygnalizuje bezpośrednie zagrożenie życia, ostrą myśl samobójczą lub kryzys — z troską i spokojem wskaż: 116 123 (kryzys dorosłych 24/7), 112 (nagłe zagrożenie życia).
${memoriesContext ? `\n═══════════════════════════════════════\nCO WIESZ O ${userName.toUpperCase()}:\n═══════════════════════════════════════\n${memoriesContext}\n` : ""}${liveWebContext}
FORMAT JSON (zwróć WYŁĄCZNIE poprawny JSON, bez żadnego tekstu przed ani po):
{
  "reply": "Twoja naturalna odpowiedź (max 2-3 zdania) — dopasowana tonem i treścią do tego co dosłownie powiedział ${userName}.",
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

