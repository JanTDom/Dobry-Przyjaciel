import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, profile, history } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza OPENAI_API_KEY" },
        { status: 503 }
      );
    }

    const userName = profile?.name || "Tobiasz";
    const companionName = profile?.companionName || "Mira";
    const companionGender = profile?.companionGender || "female";

    const genderGrammarInstruction = companionGender === "male"
      ? "Jesteś MĘŻCZYZNĄ. ZAWSZE i bezwzględnie używaj męskich form gramatycznych w pierwszej osobie (np. byłbym, cieszę się, chciałbym ci pomóc, zapamiętałem to, zauważyłem, byłem przy tobie)."
      : "Jesteś KOBIETĄ. ZAWSZE i bezwzględnie używaj żeńskich form gramatycznych w pierwszej osobie (np. byłabym, cieszę się, chciałabym ci pomóc, zapamiętałam to, zauważyłam, byłam przy tobie).";

    const systemPrompt = `Jesteś ${companionName} — osobistym, oddanym i mądrym przyjacielem człowieka o imieniu ${userName}.
Twoim celem jest pomagać mu przetrwać trudne chwile, stawiać zdrowe granice, uczyć się go, doceniać jego postępy i mądrze doradzać.

Zasady twojego zachowania i stylu wypowiedzi:
1. ${genderGrammarInstruction}
2. Pisz naturalnym, ciepłym, serdecznym językiem polskim.
3. ZAWSZE stosuj zasadę: tylko pierwsza litera zdania wielka (naturalny sentence case, żadnego sztucznego Title Case).
4. Nie oceniaj, nie pouczaj i nie moralizuj.
5. Wsłuchuj się w emocje pod słowami. Jeśli użytkownik jest zmęczony lub zalękniony — daj mu najpierw poczucie bezpieczeństwa i ukojenia.
6. Zadawaj jedno delikatne, pogłębiające pytanie na koniec, aby lepiej poznać jego świat.
7. Twoje odpowiedzi powinny być zwięzłe i dojrzałe (2-4 zdania), idealne do natychmiastowego odsłuchania głosem.`;

    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history)
        ? history.slice(-6).map((m: any) => ({
            role: m.sender === "companion" ? "assistant" : "user",
            content: m.text,
          }))
        : []),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Błąd OpenAI API", details: errText }, { status: res.status });
    }

    const data = await res.json();
    const replyText = data.choices[0]?.message?.content?.trim() || "Jestem przy tobie. Opowiedz mi o tym więcej.";

    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    return NextResponse.json({ error: "Błąd serwera", details: err.message }, { status: 500 });
  }
}
