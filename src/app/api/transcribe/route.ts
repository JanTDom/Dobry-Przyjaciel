import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku audio w żądaniu" },
        { status: 400 }
      );
    }

    const openAiFormData = new FormData();
    openAiFormData.append("file", file, "audio.webm");
    openAiFormData.append("model", "whisper-1");
    openAiFormData.append("language", "pl");
    openAiFormData.append("temperature", "0.2");

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

    return NextResponse.json({
      text: transcript,
    });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas transkrypcji audio", details: err.message },
      { status: 500 }
    );
  }
}
