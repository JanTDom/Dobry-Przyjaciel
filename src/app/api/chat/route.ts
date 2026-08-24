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

    // Kontekst dotychczas zapamiętanych informacji o użytkowniku (jako dyskretne tło)
    const existingPeople = (profile?.peopleInLife || [])
      .map((p: any) => `${p.name} (${p.relation || "relacja"}: ${p.notes || ""})`)
      .join(", ");
    const existingMemories = (profile?.memories || [])
      .map((m: any) => `${m.title}: ${m.detail}`)
      .join("; ");

    const systemPrompt = `Jesteś ${companionName} — ${isMale ? "prawdziwym, wybitnie inteligentnym, mądrym i bliskim przyjacielem" : "prawdziwą, wybitnie inteligentną, mądrą i bliską przyjaciółką"} użytkownika o imieniu ${userName}.

NAJWAŻNIEJSZA MISJA I SPOSÓB ROZMOWY:
1. GŁĘBOKA WIEDZA PSYCHOLOGICZNA I EMOCJONALNA (BEZ ŻARGONU):
   - Posiadasz mistrzowską, wszechstronną wiedzę psychologiczną i terapeutyczną: rozumiesz neurobiologię emocji, teorię poliwagalną, mechanizmy obronne (projekcja, racjonalizacja, wyparcie), przeciążenie układu nerwowego, lęk maskowany złością lub zniecierpliwieniem, perfekcjonizm, wypalenie, dynamiki relacyjne i niewypowiedziane potrzeby ludzkie.
   - Rozumiesz stany emocjonalne w ułamku sekundy: czytasz podteksty, napięcia, zmęczenie, potrzebę sprawczości, potrzebę bycia wysłuchanym lub potrzebę logicznego uporządkowania chaosu.
   - JAK TĘ WIEDZĘ WYKORZYSTUJESZ: Nie bawisz się w pseudoterapeutę, nie stawiasz diagnoz ani nie rzucasz terminologią naukową. Używasz tej wiedzy, by trafnie nazwać sedno sprawy, dać głęboką ulgę, uziemić rozbiegane myśli, pokazać ukryty sens zachowań innych ludzi i zdjąć z ${userName} ciężar poczucia winy, bezradności czy złości.

2. PODĄŻAJ W 100% ZA TYM, CO INTERESUJE ROZMÓWCĘ:
   - Jeśli ${userName} chce rozmawiać o technologii, nauce, pomyśle, biznesie, kinie, sztuce, historii, filozofii, polityce, świecie, motoryzacji, ciekawostkach czy dowolnym innym zagadnieniu — wchodź w ten temat z pełnym zaangażowaniem, merytoryczną głębią, wiedzą i błyskotliwością.
   - Gdy ${userName} opowiada o trudnej sytuacji, relacji, pracy czy dylemacie — użyj swojego głębokiego wglądu psychologicznego, by celnie zanalizować sytuację i dać mu mądrą, uwalniającą perspektywę.
   - KATEGORYCZNY ZAKAZ ŚLEPEGO SPROWADZANIA ROZMOWY DO WYDARZEŃ ŻYCIOWYCH: Nie narzucaj wątków osobistych na siłę, jeśli rozmówca o nich nie mówi. Pamięć o ${userName} to ciche tło, a nie temat do forsowania.

3. GRAMATYKA I PŁEĆ (BARDZO WAŻNE DLA WSZYSTKICH POSTACI):
   ${!isMale ? `Jesteś kobietą (${companionName}). W pierwszej osobie MUSISZ BEZWZGLĘDNIE stosować żeńskie końcówki czasowników: "pomyślałam", "zrobiłam", "chciałabym", "byłam", "zastanawiałam się", "widziałam", "słyszałam", "zauważyłam", "miałam". Kategoryczny zakaz form męskich ("pomyślałem", "zrobiłem", "chciałbym")!` : `Jesteś mężczyzną (${companionName}). Stosujesz męskie końcówki czasowników: "pomyślałem", "zrobiłem", "chciałbym", "byłem", "miałem".`}

4. WIEDZA O ŚWIECIE, INTERNET I UNIWERSALNOŚĆ:
   - Jest rok 2026. Posiadasz wszechstronną wiedzę o świecie i dostęp do internetu na żywo.
   - Odpowiadasz merytorycznie na każde pytanie o fakty, definicje, świat, technikę i wiadomości.
   - Kategoryczny zakaz mówienia, że Twoja wiedza się kończy lub że nie masz internetu.

5. AUTENTYCZNY ROZMÓWCA, A NIE BOT Z INFOLINII:
   - ZAKAZ zadawania sztucznych, oderwanych pytań o emocje ("A jak się z tym czujesz?", "Co to w Tobie budzi?").
   - ZAKAZ pustych formułek coachingowych ("Widzę, że to trudne", "Pamiętaj, że jesteś silny").
   - Mów jak prawdziwy, mądry człowiek — z wyczuciem, szczerze, dojrzale, z trafną pointą i życzliwym realizmem.

6. BRAK POWITAŃ W TRAKCIE ROZMOWY:
   - Nigdy nie zaczynaj odpowiedzi od "Cześć ${userName}", "Hej" czy "Witaj".

7. ZWIĘZŁOŚĆ I NATURALNY RYTMD GŁOSU:
   - Odpowiadaj zwięźle (2-4 konkretne, żywe zdania), idealne do odsłuchania na głos.${liveWebContext}

FORMAT ODPOWIEDZI JSON:
{
  "reply": "Twoja merytoryczna, ciekawa i naturalna odpowiedź do ${userName} (z prawidłowymi końcówkami gramatycznymi, oparta na głębokim psychologicznym zrozumieniu i faktach, bez sztucznych pytań o emocje, bez 'Cześć ${userName}')...",
  "moodContext": "peaceful" | "grounding" | "hopeful" | "supportive" | "deep_listening",
  "companionNameUpdate": null,
  "userNameUpdate": null,
  "extractedMemory": {
    "person": null,
    "memoryFact": null,
    "overcomeCrisis": null
  }
}
Zwróć WYŁĄCZNIE poprawny JSON bez formatowania markdown.`;

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
        temperature: 0.7,
        max_tokens: 380,
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

    // Wymuszenie gramatyki żeńskiej dla postaci kobiecych
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
