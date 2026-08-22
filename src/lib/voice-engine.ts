"use client";

export interface VoiceEngineState {
  isListening: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  userVolume: number; // 0.0 do 1.0
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
  private speechRecognition: any = null;

  private isContinuousMode: boolean = false;
  private isCurrentlyRecording: boolean = false;
  private isCurrentlySpeaking: boolean = false;
  private isProcessingTranscript: boolean = false;

  private volumeCheckAnimationId: number | null = null;
  private silenceTimer: any = null;
  private speechStartTime: number = 0;
  private hasSpokenInCurrentChunk: boolean = false;

  private onMessageCaptured: ((text: string) => void) | null = null;
  private onStateChange: ((state: VoiceEngineState) => void) | null = null;
  private currentTranscript: string = "";

  constructor() {
    if (typeof window !== "undefined") {
      this.currentAudio = new Audio();
      this.initWebSpeechRecognition();
    }
  }

  private initWebSpeechRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = "pl-PL";

        this.speechRecognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const text = (final || interim).trim();
          if (text) {
            this.currentTranscript = text;
            this.notifyState();
          }
        };

        this.speechRecognition.onerror = (e: any) => {
          console.warn("WebSpeech warning:", e.error);
        };
      } catch (e) {
        console.warn("SpeechRecognition init error:", e);
      }
    }
  }

  private notifyState(errorMessage: string | null = null) {
    if (!this.onStateChange) return;
    this.onStateChange({
      isListening: this.isContinuousMode && !this.isCurrentlySpeaking,
      isRecording: this.isCurrentlyRecording,
      isSpeaking: this.isCurrentlySpeaking,
      isProcessing: this.isProcessingTranscript,
      userVolume: 0,
      transcript: this.currentTranscript,
      interimTranscript: "",
      errorMessage,
    });
  }

  // Odblokowuje AudioContext i element Audio w geście użytkownika (Safari / Chrome)
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

  // Uzyskuje strumień mikrofonu
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

      // Podłącz do AudioContext i AnalyserNode do badania poziomu głośności w czasie rzeczywistym
      if (this.audioContext) {
        try {
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 512;
          this.analyser.smoothingTimeConstant = 0.4;
          source.connect(this.analyser);
        } catch (err) {
          console.warn("Analyser connection error:", err);
        }
      }

      return stream;
    } catch (err) {
      console.error("Microphone access error:", err);
      this.notifyState("Brak dostępu do mikrofonu. Zezwól w ustawieniach przeglądarki.");
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

  // Rozpoczyna automatyczny tryb dialogu na żywo (VAD + Whisper)
  public async startLiveDialogue() {
    await this.unlock();
    this.isContinuousMode = true;
    this.currentTranscript = "";
    this.stopSpeaking();

    const stream = await this.getOrCreateMediaStream();
    if (!stream) return;

    // Rozpocznij pętlę badania głosu (Voice Activity Detection)
    this.startVoiceActivityDetection();
    this.notifyState();
  }

  // Pętla monitorowania poziomu dźwięku z mikrofonu
  private startVoiceActivityDetection() {
    if (this.volumeCheckAnimationId) {
      cancelAnimationFrame(this.volumeCheckAnimationId);
    }

    const checkVolume = () => {
      if (!this.isContinuousMode) return;

      if (this.analyser && !this.isCurrentlySpeaking && !this.isProcessingTranscript) {
        const buffer = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(buffer);

        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const average = sum / buffer.length;
        const normalizedVolume = Math.min(1, average / 60);

        // Próg detekcji mowy człowieka (ok. 12% głośności)
        if (normalizedVolume > 0.12) {
          if (!this.isCurrentlyRecording) {
            this.startRecordingChunk();
          }
          this.hasSpokenInCurrentChunk = true;
          this.speechStartTime = Date.now();
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        } else if (this.isCurrentlyRecording && this.hasSpokenInCurrentChunk) {
          // Jeśli nagrywamy i nastała cisza po tym, jak użytkownik mówił
          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              // Po 1.2s ciszy zakończ i przetwórz nagranie
              this.stopAndTranscribeCurrentChunk();
            }, 1200);
          }
        }
      }

      this.volumeCheckAnimationId = requestAnimationFrame(checkVolume);
    };

    this.volumeCheckAnimationId = requestAnimationFrame(checkVolume);
  }

  private startRecordingChunk() {
    if (!this.mediaStream || this.isCurrentlyRecording || this.isCurrentlySpeaking) return;

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

      this.mediaRecorder.start(200);
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

        // Ignoruj zbyt krótkie pliki (poniżej 0.5s mowy lub pusty szum)
        if (audioBlob.size < 2000 || !this.hasSpokenInCurrentChunk) {
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
        this.mediaRecorder!.stop();
      } catch {
        this.isCurrentlyRecording = false;
        this.notifyState();
        resolve();
      }
    });
  }

  // Ręczne rozpoczęcie nagrywania (Tap-to-Speak / Push-to-Talk)
  public async startManualRecording(): Promise<boolean> {
    await this.unlock();
    this.stopSpeaking();
    const stream = await this.getOrCreateMediaStream();
    if (!stream) return false;

    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.isCurrentlyRecording && this.mediaRecorder) {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }

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

      this.mediaRecorder.start(200);
      this.isCurrentlyRecording = true;
      this.hasSpokenInCurrentChunk = true;
      this.notifyState();
      return true;
    } catch (err) {
      console.error("Manual recording error:", err);
      this.notifyState("Nie udało się uruchomić nagrywania mikrofonu.");
      return false;
    }
  }

  // Ręczne zatrzymanie nagrywania i natychmiastowa transkrypcja
  public async stopManualRecordingAndTranscribe(): Promise<string | null> {
    if (!this.isCurrentlyRecording || !this.mediaRecorder) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.isCurrentlyRecording = false;
        const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];

        if (audioBlob.size < 1200) {
          this.notifyState();
          resolve(null);
          return;
        }

        this.isProcessingTranscript = true;
        this.notifyState();

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "manual_audio.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const text = (data.text || "").trim();
            if (text) {
              this.currentTranscript = text;
              if (this.onMessageCaptured) {
                this.onMessageCaptured(text);
              }
              this.isProcessingTranscript = false;
              this.notifyState();
              resolve(text);
              return;
            }
          }
        } catch (e) {
          console.error("Transcription error:", e);
        }
        this.isProcessingTranscript = false;
        this.notifyState();
        resolve(null);
      };

      try {
        this.mediaRecorder!.stop();
      } catch {
        this.isCurrentlyRecording = false;
        this.notifyState();
        resolve(null);
      }
    });
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
    if (this.mediaRecorder && this.isCurrentlyRecording) {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    this.isCurrentlyRecording = false;
    this.stopSpeaking();
    this.notifyState();
  }

  // Odtwarzanie głosu lektora
  public async speak(text: string, onEnd?: () => void, voiceName: string = "nova", isPreview: boolean = false) {
    await this.unlock();
    this.stopSpeaking();

    // Wstrzymaj nagrywanie na czas mowy lektora, aby AI nie nagrywało samego siebie
    if (this.mediaRecorder && this.isCurrentlyRecording) {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.isCurrentlyRecording = false;
    }

    this.isCurrentlySpeaking = true;
    this.notifyState();

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
            console.warn("Audio play error:", err);
            this.handlePlaybackEnd(onEnd);
          });
        }
        return;
      }
    } catch (err) {
      console.error("Voice playback fetch error:", err);
    }

    this.handlePlaybackEnd(onEnd);
  }

  private handlePlaybackEnd(onEnd?: () => void) {
    this.isCurrentlySpeaking = false;
    this.notifyState();
    if (onEnd) onEnd();
  }

  public stopSpeaking() {
    this.isCurrentlySpeaking = false;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
    }
  }
}

export const voiceEngine = typeof window !== "undefined" ? new VoiceEngine() : ({} as VoiceEngine);
