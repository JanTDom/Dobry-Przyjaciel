import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Znane artefakty halucynacji modelu Whisper na ciszy i szumach tła
const WHISPER_HALLUCINATIONS = [
  "napisy stworzone przez",
  "napisy przygotowane przez",
  "społeczność",
  "tłumaczenie",
  "dziękuję za oglądanie",
  "dziękuję za uwagę",
  "subskrybuj",
  "subskrypcj",
  "do zobaczenia",
  "zostaw łapkę",
  "amara.org",
  "opensubtitles",
  "youtube",
  "transkrypcja",
  "teksty społeczności",
  "napisy:",
  "lektor:",
  "czytał:",
  "tłumaczył:",
  "www.",
  "http",
];

function isWhisperHallucination(text: string): boolean {
  const clean = text.toLowerCase().trim();
  if (clean.length < 2) return true;

  for (const pattern of WHISPER_HALLUCINATIONS) {
    if (clean.includes(pattern)) {
      return true;
    }
  }

  if (/^[.,!?;:\s\-_~]+$/.test(clean)) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza OPENAI_API_KEY na serwerze" },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file || file.size < 400) {
      return NextResponse.json({ text: "" });
    }

    // Wybór właściwego rozszerzenia pliku dla Whisper w zależności od typu MIME (iOS mp4 vs webm vs wav)
    const mimeType = (file.type || "").toLowerCase();
    const originalName = ((file as any).name || "").toLowerCase();
    let filename = "audio.webm";
    if (mimeType.includes("mp4") || mimeType.includes("m4a") || mimeType.includes("aac") || originalName.endsWith(".mp4") || originalName.endsWith(".m4a")) {
      filename = "audio.mp4";
    } else if (mimeType.includes("wav") || originalName.endsWith(".wav")) {
      filename = "audio.wav";
    } else if (mimeType.includes("ogg") || originalName.endsWith(".ogg")) {
      filename = "audio.ogg";
    }

    const openAiFormData = new FormData();
    openAiFormData.append("file", file, filename);
    openAiFormData.append("model", "whisper-1");
    openAiFormData.append("language", "pl");
    openAiFormData.append("temperature", "0.0");
    openAiFormData.append(
      "prompt",
      "Transkrypcja rozmowy w języku polskim. Zapisuj dosłownie i wprost dokładnie każde słowo i zdanie wypowiedziane przez użytkownika, bez żadnego skracania, przeinaczania ani pomijania."
    );

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAiFormData,
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      console.error("Whisper transcription error:", err);
      return NextResponse.json(
        { error: "Błąd transkrypcji Whisper", details: err },
        { status: whisperRes.status }
      );
    }

    const data = await whisperRes.json();
    const transcript = (data.text || "").trim();

    if (isWhisperHallucination(transcript)) {
      return NextResponse.json({ text: "" });
    }

    return NextResponse.json({
      text: transcript,
    });
  } catch (err: any) {
    console.error("Transcribe API critical error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas transkrypcji", details: err.message },
      { status: 500 }
    );
  }
}
