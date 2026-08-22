import { NextRequest, NextResponse } from "next/server";

const REQUIRED_ACCESS_CODE = "A132a132";

// ElevenLabs Voice Mapping
const ELEVENLABS_VOICES: Record<string, string> = {
  nova: "21m00Tcm4TlvDq8ikWAM", // Rachel (Ciepły, kojący kobiecy)
  shimmer: "EXAVITQu4vr4xnSDxMaL", // Sarah (Łagodny, jasny kobiecy)
  echo: "pNInz6obpgDQGcFmaJgB", // Adam (Głęboki, ciepły męski)
  onyx: "ErXwobaYiN019PkySvjV", // Antoni (Naturalny polski męski)
  fable: "TxGEqnHWrfWFTfGW9XjX", // Josh (Młody, spokojny)
  alloy: "21m00Tcm4TlvDq8ikWAM",
};

export async function POST(req: NextRequest) {
  try {
    const accessCodeHeader = req.headers.get("x-access-code");
    const body = await req.json();
    const { text, voice = "nova", accessCode, isPreview = false } = body;

    const providedCode = accessCode || accessCodeHeader;
    if (!isPreview && providedCode !== REQUIRED_ACCESS_CODE) {
      return NextResponse.json(
        { error: "Nieprawidłowy kod dostępu roboczego." },
        { status: 401 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Brak tekstu do syntezy" }, { status: 400 });
    }

    // 1. Próba użycia ElevenLabs (Hiperrealistyczny, ludzki głos z oddechem)
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (elevenKey && elevenKey.trim().length > 10) {
      const elevenVoiceId = ELEVENLABS_VOICES[voice] || "21m00Tcm4TlvDq8ikWAM";
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
                stability: 0.52,
                similarity_boost: 0.82,
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
              "x-voice-engine": "ElevenLabs",
            },
          });
        } else {
          const errText = await elevenRes.text();
          console.warn("ElevenLabs notice, falling back to OpenAI TTS:", errText);
        }
      } catch (e: any) {
        console.warn("ElevenLabs request error, falling back to OpenAI:", e.message);
      }
    }

    // 2. Niezawodny fallback do OpenAI TTS HD (Studio Quality)
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
        speed: 0.96,
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
