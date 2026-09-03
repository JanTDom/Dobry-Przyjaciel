---
name: ios-voice-pipeline
description: >-
  Ekspert iOS/Safari Web Audio Pipeline dla projektu Dobry Przyjaciel.
  Aktywuj gdy debugujesz audio na iPhone (Safari / Chrome iOS), naprawiasz
  trzaski, VAD, SpeechRecognition, MediaRecorder, AudioContext, getUserMedia
  lub unlock gesture chain. Zawiera sprawdzone zasady i znane pułapki iOS.
---

# iOS Voice Pipeline — Dobry Przyjaciel

## Kluczowy plik
`src/lib/voice-engine.ts` — singleton `VoiceEngine` eksportowany jako `voiceEngine`.

---

## 1. ABSOLUTNE ZASADY iOS Safari Web Audio

### Zasada 1 — Jeden element Audio przez cały czas życia
```ts
// DOBRZE: jeden element tworzony w konstruktorze, reużywany przez zmianę .src
constructor() {
  this.currentAudio = new Audio(); // tworzony RAZ, przed jakimkolwiek await
}

// ŹLE: new Audio() po dowolnym await — iOS blokuje play()
const blob = await fetch(...).then(r => r.blob());
const audio = new Audio(); // ← ZABLOKOWANE przez iOS
audio.play(); // ← zawsze cicho nie zadziała
```

### Zasada 2 — unlock() musi być w tym samym call stack co gest
```ts
// handleOpenLiveCall w page.tsx — KOLEJNOŚĆ KRYTYCZNA:
const handleOpenLiveCall = async () => {
  await voiceEngine.unlock(); // ← SYNCHRONICZNIE w onClick, przed jakimkolwiek setState
  setIsLiveCallOpen(true);    // ← dopiero potem
};
```

### Zasada 3 — NIE wywołuj .load() po zmianie .src
```ts
// DOBRZE:
this.currentAudio.pause();
this.currentAudio.src = newUrl; // podmiana src wystarczy
// this.currentAudio.load(); ← ZAKAZ — powoduje klik/trzask na iOS

// ŹLE:
this.currentAudio.src = newUrl;
this.currentAudio.load(); // ← trzask
```

### Zasada 4 — AudioContext BEZ wymuszania sampleRate
```ts
// DOBRZE — system sam wybiera (48kHz na iOS):
this.audioContext = new AudioCtx();

// ŹLE — iOS mikrofon jest 48kHz, AudioContext 44100 → createMediaStreamSource() może failować:
this.audioContext = new AudioCtx({ sampleRate: 44100 }); // ← ZAKAZ
```

### Zasada 5 — autoGainControl: false
```ts
// AGC normalizuje sygnał do bardzo niskich wartości → VAD rms zawsze < progu
await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false, // ← KLUCZOWE dla VAD
  }
});
```

### Zasada 6 — race condition getUserMedia
```ts
// Blokada podwójnego getUserMedia (parallel calls z useEffect i startLiveDialogue)
private _mediaStreamPending: Promise<MediaStream | null> | null = null;

public async getOrCreateMediaStream() {
  if (this.mediaStream?.active) return this.mediaStream;
  if (this._mediaStreamPending) return this._mediaStreamPending; // ← reużyj obietnicy
  this._mediaStreamPending = (async () => {
    // ... getUserMedia ...
    // finally: this._mediaStreamPending = null;
  })();
  return this._mediaStreamPending;
}
```

---

## 2. Różnice Safari iOS vs Chrome iOS

| Feature | Safari iOS | Chrome iOS |
|---|---|---|
| `webkitSpeechRecognition` | ✅ Tak | ❌ Nie (WKWebView) |
| `MediaRecorder` | ✅ Tak (mp4) | ✅ Tak (mp4) |
| `audio/webm;codecs=opus` | ❌ Nie | ❌ Nie |
| `audio/mp4` | ✅ Tak | ✅ Tak |
| AudioContext sampleRate | 48000 Hz | 48000 Hz |
| Gesture chain dla audio | Wymagany | Wymagany |

## 3. MediaRecorder na iOS — detekcja MIME
```ts
const isWebmSupported = MediaRecorder.isTypeSupported("audio/webm;codecs=opus");
const isMp4Supported = MediaRecorder.isTypeSupported("audio/mp4");
const options = isWebmSupported
  ? { mimeType: "audio/webm;codecs=opus" }
  : isMp4Supported
  ? { mimeType: "audio/mp4" }
  : undefined;
const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
// Filename dla Whisper: isMp4 ? "audio.mp4" : "audio.webm"
```

## 4. Whisper — iOS przesyła blob bez MIME
```ts
// iOS Safari/Chrome często wysyła Blob z type="" lub "application/octet-stream"
// Sprawdzaj nazwę pliku, NIE tylko MIME:
const isMp4 =
  mimeType.includes("mp4") ||
  mimeType.includes("m4a") ||
  filename.endsWith(".mp4") ||
  filename.endsWith(".m4a");
```

## 5. VAD thresholds
```ts
const rms = Math.sqrt(sum / timeData.length);
const isUserSpeaking = rms > 0.010; // próg 0.010 (AGC off → silniejszy sygnał)
const minFrames = 2; // consecutiveVoiceFrames >= 2 przed startRecording
const silenceMs = 600; // ms ciszy przed wysłaniem do Whisper
```

## 6. ElevenLabs — format audio
```
output_format=mp3_44100_128
Content-Type: audio/mpeg
```

## 7. Znane bugi i ich naprawy

| Bug | Przyczyna | Fix |
|---|---|---|
| Głos odpala się po kliknięciu X | `startMicAfterGreeting` odpala się po zamknięciu | `isOpenRef.current = false` w handleCloseModal PRZED stopLiveDialogue |
| Trzaski | `audio.load()` lub `new Audio()` po async | Usunąć `.load()`, reużywać ten sam element Audio |
| Mic nie słyszy | analyser null bo AudioContext 44100≠48000 | Usunąć sampleRate z AudioContext |
| Dialog mikrofonu przy zamknięciu | Dwa wywołania getUserMedia jednocześnie | `_mediaStreamPending` race condition guard |
