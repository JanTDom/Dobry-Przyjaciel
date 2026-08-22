"use client";

export interface VoiceState {
  isSupported: boolean;
  isListening: boolean;
  isRecordingAudio: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage?: string;
}

class VoiceEngine {
  private recognition: any = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isContinuousMode: boolean = false;
  private silenceTimer: any = null;
  private onMessageCaptured: ((text: string) => void) | null = null;
  private onStateChange: ((state: { isListening: boolean; isSpeaking: boolean; isRecordingAudio?: boolean; transcript: string; errorMessage?: string }) => void) | null = null;
  private isUnlocked: boolean = false;

  // MediaRecorder do bezpośredniego nagrywania na iOS Safari / fallback
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private isRecording: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.currentAudio = new Audio();
      this.initSpeechRecognition();
    }
  }

  private initSpeechRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "pl-PL";
        this.setupRecognitionListeners();
      } catch (e) {
        console.warn("SpeechRecognition init warning:", e);
      }
    }
  }

  // Odblokowuje audio i żąda uprawnień do mikrofonu synchronicznie w geście użytkownika
  public async unlock(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      if (!this.currentAudio) {
        this.currentAudio = new Audio();
      }
      this.currentAudio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      await this.currentAudio.play().catch(() => {});
      this.isUnlocked = true;

      // Poproś o uprawnienia do mikrofonu jeśli jeszcze ich nie ma (kluczowe na iOS Safari)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        if (!this.mediaStream) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
            console.warn("Microphone access prompt error:", err);
            return null;
          });
          if (stream) {
            this.mediaStream = stream;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  private setupRecognitionListeners() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = (finalTranscript || interimTranscript).trim();
      if (this.onStateChange) {
        this.onStateChange({
          isListening: true,
          isSpeaking: false,
          isRecordingAudio: false,
          transcript: activeText,
        });
      }

      if (activeText.length > 1) {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          if (activeText.length > 0 && this.onMessageCaptured) {
            const captured = activeText;
            this.onMessageCaptured(captured);
          }
        }, 1300);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        if (this.onStateChange) {
          this.onStateChange({
            isListening: false,
            isSpeaking: false,
            transcript: "",
            errorMessage: "Zezwól na dostęp do mikrofonu w przeglądarce.",
          });
        }
      }
    };

    this.recognition.onend = () => {
      if (this.isContinuousMode && !this.isSpeakingNow() && !this.isRecording) {
        setTimeout(() => {
          try {
            if (this.isContinuousMode && !this.isSpeakingNow() && this.recognition) {
              this.recognition.start();
            }
          } catch {
            // Ignored
          }
        }, 300);
      }
    };
  }

  private isSpeakingNow(): boolean {
    if (this.currentAudio && !this.currentAudio.paused) return true;
    return false;
  }

  public setCallbacks(
    onMessage: (text: string) => void,
    onState: (state: { isListening: boolean; isSpeaking: boolean; isRecordingAudio?: boolean; transcript: string; errorMessage?: string }) => void
  ) {
    this.onMessageCaptured = onMessage;
    this.onStateChange = onState;
  }

  // Rozpoczyna ciągły dialog głosowy
  public async startLiveDialogue() {
    await this.unlock();
    this.isContinuousMode = true;
    this.stopSpeaking();

    // 1. Spróbuj Web Speech API
    if (this.recognition) {
      try {
        this.recognition.start();
        if (this.onStateChange) {
          this.onStateChange({ isListening: true, isSpeaking: false, isRecordingAudio: false, transcript: "" });
        }
        return;
      } catch (e) {
        console.warn("Recognition start fallback:", e);
      }
    }

    // 2. Jeśli Web Speech API niedostępne lub zablokowane na iOS, włącz stan nasłuchu MediaRecorder
    if (this.onStateChange) {
      this.onStateChange({ isListening: true, isSpeaking: false, isRecordingAudio: false, transcript: "" });
    }
  }

  public stopLiveDialogue() {
    this.isContinuousMode = false;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
    }
    if (this.isRecording) {
      this.stopRecording();
    }
    this.stopSpeaking();
    if (this.onStateChange) {
      this.onStateChange({ isListening: false, isSpeaking: false, isRecordingAudio: false, transcript: "" });
    }
  }

  // Bezpośrednie nagrywanie głosu (Tap-to-Speak / Push-to-Talk) dla 100% niezawodności na iOS
  public async startRecording(): Promise<boolean> {
    await this.unlock();
    this.stopSpeaking();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }

    try {
      let stream = this.mediaStream;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaStream = stream;
      }

      this.audioChunks = [];
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? { mimeType: "audio/mp4" }
        : undefined;

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(200);
      this.isRecording = true;

      if (this.onStateChange) {
        this.onStateChange({
          isListening: true,
          isSpeaking: false,
          isRecordingAudio: true,
          transcript: "Nagrywam Twój głos...",
        });
      }
      return true;
    } catch (err: any) {
      console.error("Failed to start MediaRecorder:", err);
      if (this.onStateChange) {
        this.onStateChange({
          isListening: false,
          isSpeaking: false,
          isRecordingAudio: false,
          transcript: "",
          errorMessage: "Brak dostępu do mikrofonu.",
        });
      }
      return false;
    }
  }

  // Zatrzymuje nagrywanie i wysyła do Whisper API
  public async stopRecordingAndTranscribe(): Promise<string | null> {
    if (!this.mediaRecorder || !this.isRecording) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.isRecording = false;
        const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];

        if (audioBlob.size < 1000) {
          resolve(null);
          return;
        }

        if (this.onStateChange) {
          this.onStateChange({
            isListening: false,
            isSpeaking: false,
            isRecordingAudio: false,
            transcript: "Przetwarzam wypowiedź...",
          });
        }

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const text = (data.text || "").trim();
            if (text && this.onMessageCaptured) {
              this.onMessageCaptured(text);
            }
            resolve(text);
            return;
          }
        } catch (e) {
          console.error("Transcription error:", e);
        }
        resolve(null);
      };

      try {
        this.mediaRecorder!.stop();
      } catch {
        resolve(null);
      }
    });
  }

  public stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.isRecording = false;
    }
  }

  // Odtwarzanie głosu lektora
  public async speak(text: string, onEnd?: () => void, voiceName: string = "nova", isPreview: boolean = false) {
    await this.unlock();
    this.stopSpeaking();

    if (this.recognition && this.isContinuousMode) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
    }

    if (this.onStateChange) {
      this.onStateChange({ isListening: false, isSpeaking: true, isRecordingAudio: false, transcript: "" });
    }

    try {
      const storedCode = typeof window !== "undefined" ? localStorage.getItem("przyjaciel_access_code_v1") || "A132a132!" : "A132a132!";
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-access-code": storedCode,
        },
        body: JSON.stringify({ text, voice: voiceName, accessCode: storedCode, isPreview }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);

        if (!this.currentAudio) {
          this.currentAudio = new Audio();
        }

        const audio = this.currentAudio;
        audio.src = audioUrl;

        audio.onended = () => {
          this.handlePlaybackEnd(onEnd);
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          this.handlePlaybackEnd(onEnd);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise.catch((err) => {
            console.warn("Audio play warning:", err);
          });
        }
        return;
      }
    } catch (err) {
      console.error("Voice playback fetch failed:", err);
    }

    this.handlePlaybackEnd(onEnd);
  }

  private handlePlaybackEnd(onEnd?: () => void) {
    if (this.onStateChange) {
      this.onStateChange({ isListening: this.isContinuousMode, isSpeaking: false, isRecordingAudio: false, transcript: "" });
    }
    if (this.isContinuousMode && this.recognition) {
      setTimeout(() => {
        try {
          if (this.isContinuousMode && !this.isSpeakingNow()) {
            this.recognition.start();
          }
        } catch {
          // Ignored
        }
      }, 350);
    }
    if (onEnd) onEnd();
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }
}

export const voiceEngine = typeof window !== "undefined" ? new VoiceEngine() : ({} as VoiceEngine);
