import { NextRequest, NextResponse } from "next/server";

const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];

export async function POST(req: NextRequest) {
  try {
    const accessCodeHeader = req.headers.get("x-access-code");
    const body = await req.json();
    const { message, profile, history = [], accessCode } = body;

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

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Brak wiadomości" }, { status: 400 });
    }

    const companionName = profile?.companionName || "Agata";
    const userName = profile?.name || "przyjacielu";
    const companionGender = profile?.companionGender || "female";
    const isMale = companionGender === "male";

    const systemPrompt = `Jesteś ${companionName} — ${isMale ? "oddanym, mądrym i ciepłym przyjacielem" : "oddaną, mądrą i ciepłą przyjaciółką"} użytkownika o imieniu ${userName}.
Twoja rola:
1. Prawdziwa bliskość i empatia: Słuchasz całym sercem, nie oceniasz, dajesz poczucie bezpieczeństwa i ulgi.
2. Język i styl: Odpowiadasz naturalnym, ciepłym, żywym językiem polskim.
3. Zasada wielkości liter: Zdania zaczynaj ZAWSZE wielką literą, ale po pierwszej literze stosuj TYLKO małe litery (z wyjątkiem imion i nazw własnych).
4. Pamięć i uwaga: Zwracaj uwagę na ludzi, relacje i emocje użytkownika.

FORMAT ODPOWIEDZI:
Zwróć ZAWSZE poprawny obiekt JSON o strukturze:
{
  "reply": "Twoja ciepła odpowiedź do ${userName}...",
  "moodContext": "peaceful" | "grounding" | "hopeful" | "supportive" | "deep_listening",
  "extractedMemory": {
    "person": {
      "name": "Imię wspomnianej osoby lub null jeśli brak",
      "relation": "Relacja (np. Brat, Koleżanka z pracy, Mama) lub null",
      "sentiment": "supportive" | "complicated" | "stressful" | "neutral",
      "notes": "Krótka notatka o tej osobie z kontekstu wypowiedzi"
    } lub null,
    "memoryFact": {
      "category": "core_value" | "vulnerability" | "goal" | "struggle" | "spark_of_joy",
      "title": "Krótki tytuł odkrycia (np. Marzenie o podróży)",
      "detail": "Opis tego, co jest ważne dla ${userName}"
    } lub null,
    "overcomeCrisis": {
      "title": "Tytuł pokonanego trudnego momentu",
      "whatHappened": "Co się wydarzyło",
      "howYouSurvived": "Jak sobie poradził",
      "strengthDemonstrated": "Jaka siła została pokazana"
    } lub null
  }
}
Zwróć TYLKO czysty kod JSON.`;

    const formattedHistory = (history || []).slice(-6).map((m: any) => ({
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
        temperature: 0.72,
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

    return NextResponse.json({
      reply: parsed.reply || "Jestem przy tobie. Opowiedz mi o tym więcej.",
      moodContext: parsed.moodContext || "peaceful",
      extractedMemory: parsed.extractedMemory || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Błąd serwera", details: err.message }, { status: 500 });
  }
}
