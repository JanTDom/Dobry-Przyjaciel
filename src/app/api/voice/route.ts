import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, voice = "nova" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Brak tekstu do syntezy" }, { status: 400 });
    }

    const cleanText = text.trim();

    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json(
        { error: "Brak klucza OPENAI_API_KEY do syntezy głosu" },
        { status: 503 }
      );
    }

    const validVoices = ["nova", "shimmer", "echo", "onyx", "fable", "alloy"];
    const selectedVoice = validVoices.includes(voice) ? voice : "nova";

    // OpenAI tts-1 zoptymalizowany pod kątem natychmiastowej responsywności (< 350ms)
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: cleanText,
        voice: selectedVoice,
        response_format: "mp3",
        speed: 1.0,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI TTS error:", errText);
      return NextResponse.json({ error: "Błąd OpenAI TTS", details: errText }, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "x-voice-engine": "OpenAI-Fast",
      },
    });
  } catch (err: any) {
    console.error("Voice API error:", err);
    return NextResponse.json({ error: "Błąd serwera podczas syntezy głosu", details: err.message }, { status: 500 });
  }
}
