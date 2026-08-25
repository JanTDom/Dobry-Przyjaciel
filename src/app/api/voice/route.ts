import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mapowanie głosów na ElevenLabs (Ultra-realistyczne, ciepłe, naturalne głosy ludzkie)
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  nova: "21m00Tcm4TlvDq8ikWAM", // Rachel - ciepły, naturalny, kojący głos kobiecy
  shimmer: "EXAVITQu4vr4xnSDxMaL", // Sarah - łagodny, empatyczny głos
  alloy: "piTKgcLEGmPE4e6mEKli", // Nicole - intymny, spokojny
  echo: "pNInz6obpgDQGcFmaJgB", // Adam - głęboki, ciepły, mądry głos męski
  onyx: "ErXwobaYiN019PkySvjV", // Antoni - naturalny, wyważony głos męski
  fable: "VR6AewLTigWG4xSOukaG", // Arnold - głęboki spokój
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, voice = "nova" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Brak tekstu do syntezy" }, { status: 400 });
    }

    const cleanText = text.trim();
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // 1. Preferowany ElevenLabs Multilingual v2 (Ultra-realistyczny, ciepły ludzki głos z intonacją i empatią)
    if (elevenLabsKey) {
      try {
        const voiceId = ELEVENLABS_VOICE_MAP[voice] || ELEVENLABS_VOICE_MAP["nova"];
        const elevenRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsKey,
            },
            body: JSON.stringify({
              text: cleanText,
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
              "x-voice-engine": "ElevenLabs-Multilingual-v2",
            },
          });
        } else {
          const errText = await elevenRes.text();
          console.warn("ElevenLabs TTS warning, falling back to OpenAI:", errText);
        }
      } catch (elevenErr) {
        console.warn("ElevenLabs fetch error, falling back to OpenAI:", elevenErr);
      }
    }

    // 2. Fallback: OpenAI TTS-1-HD (High Definition)
    if (openAiKey) {
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
          speed: 1.0,
        }),
      });

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer();
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.byteLength.toString(),
            "x-voice-engine": "OpenAI-HD",
          },
        });
      }
    }

    return NextResponse.json({ error: "Brak dostępnego silnika syntezy mowy" }, { status: 503 });
  } catch (err: any) {
    console.error("Voice API error:", err);
    return NextResponse.json({ error: "Błąd serwera podczas syntezy głosu", details: err.message }, { status: 500 });
  }
}
