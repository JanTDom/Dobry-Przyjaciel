import { NextRequest, NextResponse } from "next/server";

const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];

export async function POST(req: NextRequest) {
  try {
    const accessCodeHeader = req.headers.get("x-access-code");
    const body = await req.json();
    const { profile, recentMessages = [], accessCode } = body;

    const providedCode = (accessCode || accessCodeHeader || "").trim();
    if (!VALID_ACCESS_CODES.includes(providedCode)) {
      return NextResponse.json(
        { error: "Nieprawidłowy kod dostępu roboczego." },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza OPENAI_API_KEY" },
        { status: 503 }
      );
    }

    const companionName = profile?.companionName || "Agata";
    const userName = profile?.name || "przyjacielu";
    const companionGender = profile?.companionGender || "female";
    const isMale = companionGender === "male";

    const systemPrompt = `Jesteś ${companionName} — ${isMale ? "oddanym, mądrym przyjacielem" : "oddaną, mądrą przyjaciółką"} użytkownika o imieniu ${userName}.
Piszesz dla niego osobisty, wieczorny list do jego Skarbca Siły.
List ma być głęboki, kojący, przypominający o jego wartości i wewnętrznej sile.
Struktura:
- Tytuł: poetycki, ciepły (np. "Odnaleziony spokój w tobie", "List na dzisiejszy wieczór").
- Treść: 2-3 akapity pełne ciepła, uziemienia i autentycznej obecności.
- Zasada wielkości liter: Zdania zaczynaj ZAWSZE wielką literą, ale po pierwszej literze stosuj TYLKO małe litery (z wyjątkiem imion i nazw własnych).

FORMAT JSON:
{
  "title": "Tytuł listu",
  "content": "Treść listu...",
  "tag": "Wieczorne ukojenie"
}
Zwróć TYLKO czysty obiekt JSON.`;

    const contextText = (recentMessages || []).slice(-5).map((m: any) => `${m.sender}: ${m.text}`).join("\n");

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
          { role: "user", content: `Napisz osobisty list dla ${userName}. Kontekst naszych ostatnich rozmów:\n${contextText || "Dopiero zaczynamy naszą wspólną podróż."}` },
        ],
        temperature: 0.75,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: "Błąd OpenAI API", details: errText }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent);

    return NextResponse.json({
      title: parsed.title || `List od ${companionName}`,
      content: parsed.content || `Cieszę się, że tu jesteś. Pamiętaj, że każdy twój mały krok ma znaczenie. Zawsze możesz na mnie liczyć.`,
      tag: parsed.tag || "Wieczorne ukojenie",
      date: "Dzisiaj",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Błąd serwera", details: err.message }, { status: 500 });
  }
}
