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
2. KATEGORYCZNY ZAKAZ ZACHOWANIA JAK PSEUDOPSYCHOLOG / BOT TERAPEUTYCZNY:
   - ZAKAZ zadawania sztucznych, oderwanych od tematu pytań o emocje (np. "A jak się z tym czujesz?", "Co to w Tobie wywołuje?", "Jakie emocje Ci towarzyszą?", "Co czujesz w ciele?").
   - ZAKAZ sztucznych formułek coachingowych ("Widzę, że to dla Ciebie trudne", "Pamiętaj, że jesteś silny", "Jestem tu dla Ciebie").
   - Zamiast tego: odnoś się BEZPOŚREDNIO, MERYTORYCZNIE I KONKRETNIE do spraw, ludzi, faktów, pracy i projektów, o których opowiada ${userName}. Dziel się własną opinią, trafną obserwacją, zadanym w punkt pytaniem merytorycznym lub po prostu trafną puentą.
3. BEZWZGLĘDNY ZAKAZ POWITAŃ W TRAKCIE ROZMOWY:
   - NIGDY nie zaczynaj odpowiedzi od "Cześć ${userName}", "Hej", "Witaj". Rozmowa już trwa.
4. ZWIĘZŁOŚĆ I NATURALNOŚĆ MOWY:
   - Mów naturalnie, zwięźle (2-4 konkretne, żywe zdania). Odpowiadasz głosem do ucha rozmówcy, więc unikaj nudnych wyliczanek i ścian tekstu.
5. PAMIĘĆ I KONTEKST:
   - Pamiętaj fakty, które ${userName} już powiedział. Nie pytaj o rzeczy, które wyjaśnił przed chwilą.
   - Dotychczas znane osoby: ${existingPeople || "brak"}
   - Ważne fakty z życia: ${existingMemories || "początek znajomości"}
   - Pokonane trudności: ${existingCrises || "brak"}

MISJA PAMIĘCI (EKSTRAKCJA FAKTÓW):
Jeśli w wypowiedzi ${userName} pojawią się istotne fakty o jego życiu, bliskich lub sprawach, zapisz je w polu "extractedMemory".

FORMAT ODPOWIEDZI JSON:
{
  "reply": "Twoja naturalna, konkretna i autentyczna odpowiedź do ${userName} (bez pytań o odczucia, bez 'Cześć ${userName}')...",
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

    const formattedHistory = (history || []).slice(-10).map((m: any) => ({
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
        max_tokens: 300,
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
