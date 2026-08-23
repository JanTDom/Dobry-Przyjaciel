"use client";

export interface VoiceEngineState {
  isListening: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  userVolume: number;
  transcript: string;
  interimTranscript: string;
  errorMessage?: string | null;
}

class VoiceEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;

  private isContinuousMode: boolean = false;
  private isCurrentlyRecording: boolean = false;
  private isCurrentlySpeaking: boolean = false;
  private isProcessingTranscript: boolean = false;
  private isMutedForPlayback: boolean = false;

  private volumeCheckAnimationId: number | null = null;
  private silenceTimer: any = null;
  private consecutiveVoiceFrames: number = 0;
  private hasSpokenInCurrentChunk: boolean = false;

  private onMessageCaptured: ((text: string) => void) | null = null;
  private onStateChange: ((state: VoiceEngineState) => void) | null = null;
  private currentTranscript: string = "";

  constructor() {
    if (typeof window !== "undefined") {
      this.currentAudio = new Audio();
    }
  }

  private notifyState(errorMessage: string | null = null) {
    if (!this.onStateChange) return;
    this.onStateChange({
      isListening: this.isContinuousMode && !this.isCurrentlySpeaking && !this.isMutedForPlayback,
      isRecording: this.isCurrentlyRecording,
      isSpeaking: this.isCurrentlySpeaking,
      isProcessing: this.isProcessingTranscript,
      userVolume: 0,
      transcript: this.currentTranscript,
      interimTranscript: "",
      errorMessage,
    });
  }

  // Odblokowuje AudioContext i element Audio w geście użytkownika (Safari / iOS / Chrome)
  public async unlock(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      if (!this.audioContext || this.audioContext.state === "closed") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (!this.currentAudio) {
        this.currentAudio = new Audio();
      }
      this.currentAudio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      await this.currentAudio.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  // Uzyskuje strumień mikrofonu z redukcją echa
  private async getOrCreateMediaStream(): Promise<MediaStream | null> {
    if (this.mediaStream && this.mediaStream.active) {
      return this.mediaStream;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;

      if (this.audioContext) {
        try {
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          this.analyser.smoothingTimeConstant = 0.5;
          source.connect(this.analyser);
        } catch (err) {
          console.warn("Analyser connection error:", err);
        }
      }

      return stream;
    } catch (err) {
      console.error("Microphone access error:", err);
      this.notifyState("Brak dostępu do mikrofonu. Zezwól na dostęp w przeglądarce.");
      return null;
    }
  }

  public setCallbacks(
    onMessage: (text: string) => void,
    onState: (state: VoiceEngineState) => void
  ) {
    this.onMessageCaptured = onMessage;
    this.onStateChange = onState;
  }

  // Rozpoczyna tryb ciągłego dialogu z zabezpieczeniem przed echem
  public async startLiveDialogue() {
    await this.unlock();
    this.isContinuousMode = true;
    this.currentTranscript = "";

    const stream = await this.getOrCreateMediaStream();
    if (!stream) return;

    this.startVoiceActivityDetection();
    this.notifyState();
  }

  // Pętla monitorowania poziomu głosu (VAD) z filtrem szumu tła i zabezpieczeniem echa
  private startVoiceActivityDetection() {
    if (this.volumeCheckAnimationId) {
      cancelAnimationFrame(this.volumeCheckAnimationId);
    }

    const checkVolume = () => {
      if (!this.isContinuousMode) return;

      // Badamy mikrofon TYLKO gdy głośnik NIE gra i nie trwa przetwarzanie odpowiedzi
      if (
        this.analyser &&
        !this.isCurrentlySpeaking &&
        !this.isMutedForPlayback &&
        !this.isProcessingTranscript
      ) {
        const buffer = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(buffer);

        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const average = sum / buffer.length;
        const normalizedVolume = Math.min(1, average / 128);

        // Podniesiony próg detekcji głosu człowieka (> 0.22) zapobiega fałszywym startom na szumie wentylatora
        if (normalizedVolume > 0.22) {
          this.consecutiveVoiceFrames++;
          if (this.consecutiveVoiceFrames >= 3) {
            if (!this.isCurrentlyRecording) {
              this.startRecordingChunk();
            }
            this.hasSpokenInCurrentChunk = true;
            if (this.silenceTimer) {
              clearTimeout(this.silenceTimer);
              this.silenceTimer = null;
            }
          }
        } else {
          this.consecutiveVoiceFrames = Math.max(0, this.consecutiveVoiceFrames - 1);
          if (this.isCurrentlyRecording && this.hasSpokenInCurrentChunk) {
            if (!this.silenceTimer) {
              this.silenceTimer = setTimeout(() => {
                this.stopAndTranscribeCurrentChunk();
              }, 1800); // 1.8s naturalnej pauzy: pozwala spokojnie wziąć oddech i wypowiedzieć 3-4 zdania bez przerywania
            }
          }
        }
      }

      this.volumeCheckAnimationId = requestAnimationFrame(checkVolume);
    };

    this.volumeCheckAnimationId = requestAnimationFrame(checkVolume);
  }

  private startRecordingChunk() {
    if (
      !this.mediaStream ||
      this.isCurrentlyRecording ||
      this.isCurrentlySpeaking ||
      this.isMutedForPlayback
    ) {
      return;
    }

    try {
      this.audioChunks = [];
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? { mimeType: "audio/mp4" }
        : undefined;

      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(250);
      this.isCurrentlyRecording = true;
      this.hasSpokenInCurrentChunk = false;
      this.notifyState();
    } catch (e) {
      console.warn("MediaRecorder start error:", e);
    }
  }

  private async stopAndTranscribeCurrentChunk() {
    if (!this.isCurrentlyRecording || !this.mediaRecorder) return;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    return new Promise<void>((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.isCurrentlyRecording = false;
        const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];

        // Ignoruj zbyt małe pliki (< 4KB to pusta cisza lub szum tła)
        if (audioBlob.size < 4000 || !this.hasSpokenInCurrentChunk) {
          this.notifyState();
          resolve();
          return;
        }

        this.isProcessingTranscript = true;
        this.notifyState();

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const text = (data.text || "").trim();
            if (text && text.length > 1) {
              this.currentTranscript = text;
              if (this.onMessageCaptured) {
                this.onMessageCaptured(text);
              }
            }
          }
        } catch (err) {
          console.error("Transcription error:", err);
        } finally {
          this.isProcessingTranscript = false;
          this.notifyState();
          resolve();
        }
      };

      try {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      } catch {
        this.isCurrentlyRecording = false;
        this.notifyState();
        resolve();
      }
    });
  }

  // Ręczne rozpoczęcie nagrywania (Tap-to-Speak)
  public async startManualRecording(): Promise<boolean> {
    await this.unlock();
    this.stopSpeaking();

    const stream = await this.getOrCreateMediaStream();
    if (!stream) return false;

    try {
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

      this.mediaRecorder.start(250);
      this.isCurrentlyRecording = true;
      this.hasSpokenInCurrentChunk = true;
      this.notifyState();
      return true;
    } catch (e) {
      console.error("Manual recording error:", e);
      return false;
    }
  }

  // Ręczne zakończenie nagrania i wysłanie do transkrypcji
  public async stopManualRecordingAndTranscribe(): Promise<string | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
      this.isCurrentlyRecording = false;
      this.notifyState();
      return null;
    }

    return new Promise<string | null>((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.isCurrentlyRecording = false;
        const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];

        if (audioBlob.size < 2000) {
          this.notifyState();
          resolve(null);
          return;
        }

        this.isProcessingTranscript = true;
        this.notifyState();

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const text = (data.text || "").trim();
            this.currentTranscript = text;
            resolve(text || null);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.error("Manual transcribe error:", err);
          resolve(null);
        } finally {
          this.isProcessingTranscript = false;
          this.notifyState();
        }
      };

      try {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      } catch {
        this.isCurrentlyRecording = false;
        this.notifyState();
        resolve(null);
      }
    });
  }

  // Odtwarzanie głosu lektora (TTS) z wyciszeniem mikrofonu na czas mowy
  public async speak(
    text: string,
    onEnded?: () => void,
    voice: string = "nova",
    skipIfBusy = false
  ): Promise<boolean> {
    if (!text || text.trim().length === 0) return false;

    // Zabezpieczenie przed echem: natychmiast wyciszamy mikrofon i przerywamy nagrywanie
    this.isMutedForPlayback = true;
    if (this.isCurrentlyRecording && this.mediaRecorder) {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.isCurrentlyRecording = false;
    }

    this.stopSpeaking();
    this.isCurrentlySpeaking = true;
    this.notifyState();

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice: voice || "nova",
        }),
      });

      if (!res.ok) {
        this.isCurrentlySpeaking = false;
        this.isMutedForPlayback = false;
        this.notifyState();
        if (onEnded) onEnded();
        return false;
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      if (!this.currentAudio) {
        this.currentAudio = new Audio();
      }

      this.currentAudio.src = audioUrl;

      return new Promise((resolve) => {
        if (!this.currentAudio) {
          this.isCurrentlySpeaking = false;
          this.isMutedForPlayback = false;
          this.notifyState();
          if (onEnded) onEnded();
          resolve(false);
          return;
        }

        this.currentAudio.onended = () => {
          this.isCurrentlySpeaking = false;
          // Dodajemy 450ms buforu po zakończeniu mowy lektora, aby pogłos głośnika nie aktywował mikrofonu
          setTimeout(() => {
            this.isMutedForPlayback = false;
            this.notifyState();
            if (onEnded) onEnded();
            resolve(true);
          }, 450);
        };

        this.currentAudio.onerror = (e) => {
          console.warn("Audio playback error:", e);
          this.isCurrentlySpeaking = false;
          this.isMutedForPlayback = false;
          this.notifyState();
          if (onEnded) onEnded();
          resolve(false);
        };

        this.currentAudio.play().catch((err) => {
          console.warn("Audio play prevented:", err);
          this.isCurrentlySpeaking = false;
          this.isMutedForPlayback = false;
          this.notifyState();
          if (onEnded) onEnded();
          resolve(false);
        });
      });
    } catch (err) {
      console.error("Speak error:", err);
      this.isCurrentlySpeaking = false;
      this.isMutedForPlayback = false;
      this.notifyState();
      if (onEnded) onEnded();
      return false;
    }
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
    }
    this.isCurrentlySpeaking = false;
    this.notifyState();
  }

  public stopLiveDialogue() {
    this.isContinuousMode = false;
    if (this.volumeCheckAnimationId) {
      cancelAnimationFrame(this.volumeCheckAnimationId);
      this.volumeCheckAnimationId = null;
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    this.isCurrentlyRecording = false;
    this.isMutedForPlayback = false;
    this.stopSpeaking();
    this.notifyState();
  }
}

export const voiceEngine = new VoiceEngine();
