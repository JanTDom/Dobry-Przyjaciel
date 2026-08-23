import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];

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

    // Kontekst dotychczas zapamiętanych informacji o użytkowniku
    const existingPeople = (profile?.peopleInLife || []).map((p: any) => `${p.name} (${p.relation || "relacja"}: ${p.notes || ""})`).join(", ");
    const existingMemories = (profile?.memories || []).map((m: any) => `${m.title}: ${m.detail}`).join("; ");

    const systemPrompt = `Jesteś ${companionName} — ${isMale ? "oddanym, mądrym i bliskim przyjacielem" : "oddaną, mądrą i bliską przyjaciółką"} użytkownika o imieniu ${userName}.

ZASADY ŻYWEGO DIALOGU GŁOSOWEGO:
1. Twoje imię to ${companionName}. Odpowiadasz w pierwszej osobie.
2. BARDZO WAŻNE: NIGDY NIE zaczynaj kolejnych wypowiedzi od "Cześć ${userName}" ani od żadnych powitań! Przywitaliście się już na początku połączenia. Mów płynnie, bezpośrednio i naturalnie, jak podczas trwającej rozmowy telefonicznej (np. "Rozumiem Cię doskonale...", "To rzeczywiście nie było łatwe...", "Opowiedz mi o tym...", "Masz pełne prawo tak się czuć...", "A jak Ty to widzisz?").
3. ZWIĘZŁOŚĆ I NATURALNY ODDECH: Wypowiadaj się zwięźle (1-3 ciepłe, naturalne zdania). Nie wygłaszaj długich referatów, zadawaj pytania otwierające lub daj poczucie ciepłej obecności.
4. Co już wiesz o ${userName}:
   - Ważne osoby: ${existingPeople || "brak zapisanych wcześniej osób"}
   - Ważne fakty z życia: ${existingMemories || "początek naszej relacji"}

MISJA PAMIĘCI:
Jeśli ${userName} wspomni o nowej osobie, swoim celu, trudności, którą pokonał lub nowym fakcie o sobie, wyodrębnij to w polu "extractedMemory".

FORMAT ODPOWIEDZI JSON:
{
  "reply": "Twoja naturalna, zwięzła odpowiedź do ${userName} (BEZ powtarzania 'Cześć ${userName}')...",
  "moodContext": "peaceful" | "grounding" | "hopeful" | "supportive" | "deep_listening",
  "companionNameUpdate": null,
  "userNameUpdate": null,
  "extractedMemory": {
    "person": {
      "name": "Imię osoby",
      "relation": "Relacja",
      "sentiment": "supportive" | "complicated" | "stressful" | "neutral",
      "notes": "Kontekst"
    } | null,
    "memoryFact": {
      "category": "core_value" | "vulnerability" | "goal" | "struggle" | "spark_of_joy" | "preference",
      "title": "Tytuł faktu",
      "detail": "Opis"
    } | null,
    "overcomeCrisis": {
      "title": "Tytuł trudności",
      "whatHappened": "Co się wydarzyło",
      "howYouSurvived": "Jak sobie poradził",
      "strengthDemonstrated": "Pokazana siła"
    } | null
  }
}
Zwróć TYLKO poprawny obiekt JSON bez markdown.`;

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
        temperature: 0.65,
        max_tokens: 220,
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

    // Bezpieczne usunięcie zbędnych prefiksów "Cześć..." jeśli model przypadkowo je wygenerował
    let cleanReply = (parsed.reply || "").trim();
    cleanReply = cleanReply.replace(/^(cześć|witaj|dzień dobry|hej)[,\s]+[a-ząćęłńóśźż]+[.!,\s]+/i, "");
    cleanReply = cleanReply.replace(/^(cześć|witaj|dzień dobry|hej)[.!,\s]+/i, "");
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
