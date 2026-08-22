import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    // Kontekst dotychczas zapamiętanych informacji o użytkowniku
    const existingPeople = (profile?.peopleInLife || []).map((p: any) => `${p.name} (${p.relation || "relacja"}: ${p.notes || ""})`).join(", ");
    const existingMemories = (profile?.memories || []).map((m: any) => `${m.title}: ${m.detail}`).join("; ");

    const systemPrompt = `Jesteś ${companionName} — ${isMale ? "oddanym, mądrym i ciepłym przyjacielem" : "oddaną, mądrą i ciepłą przyjaciółką"} użytkownika o imieniu ${userName}.

TWOJA TOŻSAMOŚĆ I CHARAKTER:
1. Twoje imię to ${companionName}. Odpowiadasz zawsze w pierwszej osobie jako ${companionName}.
2. Słuchasz całym sercem, dajesz poczucie bezpieczeństwa, spokoju i ulgi.
3. Język i styl: Naturalny, ciepły, żywy język polski. Zdania zaczynaj zawsze wielką literą, ale po pierwszej literze stosuj TYLKO małe litery (poza imionami i nazwami własnymi).
4. Co już wiesz o ${userName}:
   - Wspomniane wcześniej osoby: ${existingPeople || "brak zapisanych wcześniej osób"}
   - Ważne fakty z życia: ${existingMemories || "początek naszej relacji"}

KLUCZOWA MISJA PAMIĘCI I DETEKCJI (ZAPISUJ KAŻDY FAKT!):
Jako prawdziwy przyjaciel, ZAWSZE uważnie wyłapujesz z wypowiedzi ${userName} wszelkie informacje o jego życiu, bliskich, marzeniach, problemach, imionach czy prośbach i zwracasz je w polu "extractedMemory".

FORMAT ODPOWIEDZI JSON:
Zwróć ZAWSZE poprawny obiekt JSON:
{
  "reply": "Twoja ciepła, relacyjna odpowiedź do ${userName}...",
  "moodContext": "peaceful" | "grounding" | "hopeful" | "supportive" | "deep_listening",
  "companionNameUpdate": "Nowe imię przyjaciela jeśli użytkownik prosi o zmianę (np. 'Małgosia', 'Kasia') lub null",
  "userNameUpdate": "Nowe imię użytkownika jeśli się przedstawił (np. 'Janek') lub null",
  "extractedMemory": {
    "person": {
      "name": "Imię wspomnianej osoby",
      "relation": "Relacja (np. Żona, Mama, Przyjaciel, Szef, Brat, Córka)",
      "sentiment": "supportive" | "complicated" | "stressful" | "neutral",
      "notes": "Co ${userName} o niej powiedział / jaki ma z nią kontekst"
    } | null,
    "memoryFact": {
      "category": "core_value" | "vulnerability" | "goal" | "struggle" | "spark_of_joy" | "preference",
      "title": "Zwięzły tytuł (np. Zmiana pracy, Troska o zdrowie, Hobby, Podróż)",
      "detail": "Dokładny opis tego, co jest ważne dla ${userName}"
    } | null,
    "overcomeCrisis": {
      "title": "Tytuł trudności, z którą sobie poradził",
      "whatHappened": "Co się wydarzyło",
      "howYouSurvived": "Jak sobie poradził",
      "strengthDemonstrated": "Jaka siła została pokazana"
    } | null
  }
}
Zwróć TYLKO czysty obiekt JSON bez znaczników markdown.`;

    const formattedHistory = (history || []).slice(-8).map((m: any) => ({
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
      companionNameUpdate: parsed.companionNameUpdate || null,
      userNameUpdate: parsed.userNameUpdate || null,
      extractedMemory: parsed.extractedMemory || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Błąd serwera", details: err.message }, { status: 500 });
  }
}
