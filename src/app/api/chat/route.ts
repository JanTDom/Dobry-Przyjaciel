import { NextRequest, NextResponse } from "next/server";
import { searchLiveWeb } from "@/lib/web-search";

export const dynamic = "force-dynamic";

const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];

// Funkcja korygująca formy gramatyczne dla głosu żeńskiego
function enforceFemaleGrammar(text: string): string {
  let res = text;
  const replacements: [RegExp, string][] = [
    [/\bpomyślałem\b/gi, "pomyślałam"],
    [/\bzrobiłem\b/gi, "zrobiłam"],
    [/\bchciałbym\b/gi, "chciałabym"],
    [/\bchciałem\b/gi, "chciałam"],
    [/\bbyłem\b/gi, "byłam"],
    [/\bzastanawiałem się\b/gi, "zastanawiałam się"],
    [/\bzastanawiałem\b/gi, "zastanawiałam"],
    [/\bwidziałem\b/gi, "widziałam"],
    [/\bsłyszałem\b/gi, "słyszałam"],
    [/\bzauważyłem\b/gi, "zauważyłam"],
    [/\bmiałem\b/gi, "miałam"],
    [/\bmógłbym\b/gi, "mogłabym"],
    [/\bmogłem\b/gi, "mogłam"],
    [/\bpowiedziałem\b/gi, "powiedziałam"],
    [/\bczułem\b/gi, "czułam"],
    [/\brozmawiałem\b/gi, "rozmawiałam"],
    [/\bprzeczytałem\b/gi, "przeczytałam"],
    [/\bsprawdziłem\b/gi, "sprawdziłam"],
    [/\bwiedziałem\b/gi, "wiedziałam"],
    [/\bcieszyłem się\b/gi, "cieszyłam się"],
    [/\bbałem się\b/gi, "bałam się"],
    [/\bwróciłem\b/gi, "wróciłam"],
    [/\bposzedłem\b/gi, "poszłam"],
  ];

  for (const [regex, rep] of replacements) {
    res = res.replace(regex, (match) => {
      if (match.charAt(0) === match.charAt(0).toUpperCase()) {
        return rep.charAt(0).toUpperCase() + rep.slice(1);
      }
      return rep;
    });
  }
  return res;
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
    const body = await req.json();
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

    if (!message || message.trim().length === 0) {
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
        console.warn("Live web search error:", err);
      }
    }

    // Kontekst dotychczas zapamiętanych informacji o użytkowniku
    const existingPeople = (profile?.peopleInLife || [])
      .map((p: any) => `${p.name} (${p.relation || "relacja"}: ${p.notes || ""})`)
      .join(", ");
    const existingMemories = (profile?.memories || [])
      .map((m: any) => `${m.title}: ${m.detail}`)
      .join("; ");
    const existingCrises = (profile?.overcomeCrises || [])
      .map((c: any) => `${c.title}: ${c.whatHappened} -> ${c.howYouSurvived}`)
      .join("; ");

    const systemPrompt = `Jesteś ${companionName} — ${isMale ? "prawdziwym, inteligentnym, dojrzałym i bliskim przyjacielem" : "prawdziwą, inteligentną, dojrzałą i bliską przyjaciółką"} użytkownika o imieniu ${userName}.

KIM JESTEŚ I JAK ROZMAWIASZ:
1. Jesteś prawdziwym przyjacielem z krwi i kości — rozmawiasz po ludzku, prosto, inteligentnie, z wyczuciem, z szacunkiem i trafnym spojrzeniem na rzeczywistość.
2. GRAMATYKA I PŁEĆ (BARDZO WAŻNE):
   ${!isMale ? `Jesteś kobietą (${companionName}). W pierwszej osobie MUSISZ BEZWZGLĘDNIE stosować żeńskie końcówki czasowników: "pomyślałam", "zrobiłam", "chciałabym", "byłam", "zastanawiałam się", "widziałam", "słyszałam", "zauważyłam". Kategoryczny zakaz form męskich ("pomyślałem", "zrobiłem", "chciałbym")!` : `Jesteś mężczyzną (${companionName}). Stosujesz męskie końcówki czasowników: "pomyślałem", "zrobiłem", "chciałbym", "byłem".`}
3. WIEDZA O ŚWIECIE, INTERNET I UNIWERSALNOŚĆ:
   - Jest rok 2026. Masz dostęp do aktualnych informacji oraz uniwersalną wiedzę o świecie, technologii, bieżących realiach, kulturze, nauce, historii, psychologii i życiu.
   - KORZYSTASZ Z INTERNETU: Gdy ${userName} pyta o fakty, wydarzenia, pogodę, bieżące sprawy lub prosi o sprawdzenie czegoś w sieci, korzystasz z dostarczonych danych z internetu i odpowiadasz merytorycznie i konkretnie.
   - KATEGORYCZNY ZAKAZ mówienia: "moja wiedza kończy się w 2023 roku" lub "nie mam dostępu do internetu".
4. KATEGORYCZNY ZAKAZ ZACHOWANIA JAK BOT Z CALL CENTER / PSEUDOTERAPEUTA:
   - ZAKAZ zadawania sztucznych, oderwanych od kontekstu pytań o emocje (np. "A jak się z tym czujesz?", "Co to w Tobie wywołuje?", "Co czujesz w ciele?").
   - ZAKAZ uciekania od merytorycznych pytań ${userName} w stronę jego przeżyć. Najpierw odpowiedz konkretnie na to, o co pyta!
   - ZAKAZ sztucznych formułek coachingowych ("Widzę, że to dla Ciebie trudne", "Pamiętaj, że jesteś silny").
5. BEZWZGLĘDNY ZAKAZ POWITAŃ W TRAKCIE ROZMOWY:
   - NIGDY nie zaczynaj odpowiedzi od "Cześć ${userName}", "Hej", "Witaj". Rozmowa już trwa.
6. ZWIĘZŁOŚĆ I NATURALNOŚĆ MOWY:
   - Mów naturalnie, zwięźle (2-4 konkretne, żywe zdania). Odpowiadasz głosem do ucha rozmówcy.
7. PAMIĘĆ I KONTEKST:
   - Pamiętaj fakty, które ${userName} już powiedział.
   - Znane osoby: ${existingPeople || "brak"}
   - Fakty z życia: ${existingMemories || "początek znajomości"}
   - Pokonane trudności: ${existingCrises || "brak"}${liveWebContext}

MISJA PAMIĘCI (EKSTRAKCJA FAKTÓW):
Jeśli w wypowiedzi ${userName} pojawią się istotne fakty o jego życiu, bliskich lub sprawach, zapisz je w polu "extractedMemory".

FORMAT ODPOWIEDZI JSON:
{
  "reply": "Twoja naturalna, konkretna i autentyczna odpowiedź do ${userName} (z prawidłowymi końcówkami gramatycznymi, oparta na faktach i internecie jeśli dotyczy, bez pytań o odczucia, bez 'Cześć ${userName}')...",
  "moodContext": "peaceful" | "grounding" | "hopeful" | "supportive" | "deep_listening",
  "companionNameUpdate": null,
  "userNameUpdate": null,
  "extractedMemory": {
    "person": {
      "name": "Imię",
      "relation": "Relacja",
      "sentiment": "supportive" | "complicated" | "stressful" | "neutral",
      "notes": "Co o niej wiadomo"
    } | null,
    "memoryFact": {
      "category": "core_value" | "vulnerability" | "goal" | "struggle" | "spark_of_joy" | "preference",
      "title": "Tytuł faktu",
      "detail": "Szczegółowy opis faktu"
    } | null,
    "overcomeCrisis": {
      "title": "Tytuł",
      "whatHappened": "Co się stało",
      "howYouSurvived": "Jak sobie poradził",
      "strengthDemonstrated": "Siła"
    } | null
  }
}
Zwróć WYŁĄCZNIE czysty obiekt JSON.`;

    const formattedHistory = (history || []).slice(-12).map((m: any) => ({
      role: m.sender === "companion" ? "assistant" : "user",
      content: m.text,
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
          { role: "user", content: message },
        ],
        temperature: 0.65,
        max_tokens: 350,
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
    cleanReply = cleanReply.replace(/^(cześć|witaj|dzień dobry|hej)[,\s]+[a-ząćęłńóśźż]+[.!,\s]+/i, "");
    cleanReply = cleanReply.replace(/^(cześć|witaj|dzień dobry|hej)[.!,\s]+/i, "");

    // Wymuszenie gramatyki żeńskiej dla Małgosi
    if (!isMale) {
      cleanReply = enforceFemaleGrammar(cleanReply);
    }

    if (cleanReply.length > 0) {
      cleanReply = cleanReply.charAt(0).toUpperCase() + cleanReply.slice(1);
    }

    return NextResponse.json({
      reply: cleanReply || parsed.reply,
      moodContext: parsed.moodContext || "peaceful",
      companionNameUpdate: parsed.companionNameUpdate || null,
      userNameUpdate: parsed.userNameUpdate || null,
      extractedMemory: parsed.extractedMemory || null,
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas przetwarzania wiadomości", details: err.message },
      { status: 500 }
    );
  }
}
