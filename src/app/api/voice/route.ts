import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Dedykowane, autentyczne polskie głosy z naturalnym oddechem i ciepłą intonacją
const ELEVENLABS_VOICES: Record<string, string> = {
  nova: "xJQ0EWXEICoCWK3Ld1Ew", // Ciepły, medytacyjny polski głos kobiecy (Małgosia / Agata)
  shimmer: "Jh0mX1tXXa7ZuZmHDYFp", // Ciepła, przyjacielska polska lektorka
  echo: "Qs4qmNrqlneCgYPLSNQ7", // Maciej Litwiniec - Spokojny, uziemiający, ciepły polski głos męski
  onyx: "8qCMI2ZZW5ZGwmg0lM1l", // Radiowy, ciepły głos męski
  fable: "ZrIglAg8qumzXuvlNzWL", // Serdeczny głos
  alloy: "xJQ0EWXEICoCWK3Ld1Ew",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, voice = "nova" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Brak tekstu do syntezy" }, { status: 400 });
    }

    const cleanText = text.trim();

    // 1. Próba ElevenLabs (Ciepły, naturalny polski głos lektorski)
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (elevenKey && elevenKey.trim().length > 10) {
      const elevenVoiceId = ELEVENLABS_VOICES[voice] || "xJQ0EWXEICoCWK3Ld1Ew";
      try {
        const elevenRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenKey.trim(),
            },
            body: JSON.stringify({
              text: cleanText,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.45,
                similarity_boost: 0.85,
                style: 0.25,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (elevenRes.ok) {
          const audioBuffer = await elevenRes.arrayBuffer();
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.byteLength.toString(),
              "x-voice-engine": "ElevenLabs-Polish",
            },
          });
        } else {
          const errText = await elevenRes.text();
          console.warn("ElevenLabs returned error, falling back to OpenAI TTS:", errText);
        }
      } catch (e: any) {
        console.warn("ElevenLabs request failed, falling back to OpenAI:", e.message);
      }
    }

    // 2. Niezawodny fallback do OpenAI TTS HD
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json(
        { error: "Brak klucza OPENAI_API_KEY do syntezy głosu" },
        { status: 503 }
      );
    }

    const validVoices = ["nova", "shimmer", "echo", "onyx", "fable", "alloy"];
    const selectedVoice = validVoices.includes(voice) ? voice : "nova";

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: cleanText,
        voice: selectedVoice,
        response_format: "mp3",
        speed: 0.95,
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
        "x-voice-engine": "OpenAI-HD",
      },
    });
  } catch (err: any) {
    console.error("Voice API error:", err);
    return NextResponse.json({ error: "Błąd serwera podczas syntezy głosu", details: err.message }, { status: 500 });
  }
}
