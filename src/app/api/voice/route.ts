import { NextRequest, NextResponse } from "next/server";

const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];

// Dedykowane, autentyczne polskie głosy z naturalnym oddechem i ciepłą intonacją
const ELEVENLABS_VOICES: Record<string, string> = {
  nova: "xJQ0EWXEICoCWK3Ld1Ew", // Agata - Ciepły, medytacyjny, kojący polski głos kobiecy
  shimmer: "Jh0mX1tXXa7ZuZmHDYFp", // Paula - Ciepła, przyjacielska polska lektorka
  echo: "Qs4qmNrqlneCgYPLSNQ7", // Maciej Litwiniec - Spokojny, uziemiający, ciepły polski głos męski
  onyx: "8qCMI2ZZW5ZGwmg0lM1l", // Paweł Siwek - Ciepły, zrelaksowany radiowy głos męski
  fable: "ZrIglAg8qumzXuvlNzWL", // Weronika - Naturalna, serdeczna polska przyjaciółka
  alloy: "xJQ0EWXEICoCWK3Ld1Ew",
};

export async function POST(req: NextRequest) {
  try {
    const accessCodeHeader = req.headers.get("x-access-code");
    const body = await req.json();
    const { text, voice = "nova", accessCode, isPreview = false } = body;

    const providedCode = accessCode || accessCodeHeader;
    if (!isPreview && !VALID_ACCESS_CODES.includes(providedCode)) {
      return NextResponse.json(
        { error: "Nieprawidłowy kod dostępu roboczego." },
        { status: 401 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Brak tekstu do syntezy" }, { status: 400 });
    }

    // 1. ElevenLabs (Autentyczny, ciepły polski głos lektorski)
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
              text: text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.45,
                similarity_boost: 0.85,
                style: 0.30,
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
          console.warn("ElevenLabs error, falling back to OpenAI:", errText);
        }
      } catch (e: any) {
        console.warn("ElevenLabs request error:", e.message);
      }
    }

    // 2. Rezerwowy fallback do OpenAI TTS HD
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json(
        { error: "Brak klucza API do syntezy głosu" },
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
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
        speed: 0.94,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
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
    return NextResponse.json({ error: "Błąd serwera", details: err.message }, { status: 500 });
  }
}
