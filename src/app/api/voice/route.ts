import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mapowanie głosów na natywne, ciepłe i kojące głosy ElevenLabs w języku polskim
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  // Głosy żeńskie (Ciepłe, wyciszające, terapeutyczne, bez pośpiechu i bez mechaniczności)
  nova: "xJQ0EWXEICoCWK3Ld1Ew", // Agata - Warm, Soothing, Meditative (Polska lektorka o kojącym, głębokim tembrze)
  shimmer: "Jh0mX1tXXa7ZuZmHDYFp", // Paula - Warm & Friendly Narrator (Ciepła, serdeczna polska lektorka)
  alloy: "xJQ0EWXEICoCWK3Ld1Ew", // Agata

  // Głosy męskie (Spokojne, mądre, uziemiające)
  echo: "8qCMI2ZZW5ZGwmg0lM1l", // Paweł Siwek - Engaging, Warm Radio Host (Głęboki, ciepły radiowy głos męski)
  onyx: "GvFYRPRytx7jphnfTmpN", // Marcin - Polish Narrator (Stabilny, życzliwy polski lektor)
  fable: "8qCMI2ZZW5ZGwmg0lM1l", // Paweł Siwek
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

    // 1. ElevenLabs Multilingual v2 z dedykowanymi polskimi głosami
    if (elevenLabsKey) {
      try {
        const voiceId = ELEVENLABS_VOICE_MAP[voice] || ELEVENLABS_VOICE_MAP["nova"];
        const elevenRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128&optimize_streaming_latency=3`,
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
                stability: 0.68, // Wysoka stabilność zapobiega agresywnym, natarczywym skokom intonacji
                similarity_boost: 0.85, // Czyste, naturalne brzmienie polskiej wymowy
                style: 0.10, // Łagodna, spokojna ekspresja
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
              "x-voice-engine": "ElevenLabs-Polish-Meditative",
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

    // 2. Fallback: OpenAI TTS-1-HD
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
          speed: 0.95, // Lekko zwolnione tempo dla większego spokoju
        }),
      });

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer();
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.byteLength.toString(),
            "x-voice-engine": "OpenAI-HD-Slow",
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
