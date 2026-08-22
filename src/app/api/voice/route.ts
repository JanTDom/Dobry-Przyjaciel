import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "nova" } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza OPENAI_API_KEY" },
        { status: 503 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Brak tekstu do syntezy" }, { status: 400 });
    }

    // Walidacja dostępnych głosów OpenAI
    const validVoices = ["nova", "shimmer", "echo", "onyx", "fable", "alloy"];
    const selectedVoice = validVoices.includes(voice) ? voice : "nova";

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
        speed: 0.95, // Spokojne, ciepłe tempo
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Błąd syntezy OpenAI TTS", details: errText }, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Błąd serwera", details: err.message }, { status: 500 });
  }
}
