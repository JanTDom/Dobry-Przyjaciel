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

  private speechRecognition: any = null;
  private lastCapturedTimestamp: number = 0;
  private lastCapturedText: string = "";
  private nativeInterimTimer: any = null;
  private lastNativeInterimText: string = "";

  private onMessageCaptured: ((text: string) => void) | null = null;
  private onStateChange: ((state: VoiceEngineState) => void) | null = null;
  private currentTranscript: string = "";

  constructor() {
    if (typeof window !== "undefined") {
      this.currentAudio = new Audio();
    }
  }

  private notifyState(errorMessage: string | null = null, currentVolume: number = 0) {
    if (!this.onStateChange) return;
    this.onStateChange({
      isListening: this.isContinuousMode && !this.isCurrentlySpeaking && !this.isMutedForPlayback,
      isRecording: this.isCurrentlyRecording,
      isSpeaking: this.isCurrentlySpeaking,
      isProcessing: this.isProcessingTranscript,
      userVolume: currentVolume,
      transcript: this.currentTranscript,
      interimTranscript: this.lastNativeInterimText,
      errorMessage,
    });
  }

  // Bezpieczne przekazanie rozpoznanej mowy z deduplikacją
  private handleCapturedSpeech(text: string) {
    const clean = text.trim();
    if (!clean || clean.length < 2) return;

    const now = Date.now();
    // Sprawdź czy to samo zdanie nie zostało przetworzone przed chwilą
    if (
      this.lastCapturedText.toLowerCase() === clean.toLowerCase() &&
      now - this.lastCapturedTimestamp < 2500
    ) {
      return;
    }

    this.lastCapturedText = clean;
    this.lastCapturedTimestamp = now;
    this.currentTranscript = clean;
    this.hasSpokenInCurrentChunk = false;
    this.lastNativeInterimText = "";

    // Jeśli lektor w tym momencie mówił, zatrzymaj go, bo użytkownik wszedł w słowo
    if (this.isCurrentlySpeaking) {
      this.stopSpeaking();
    }

    if (this.onMessageCaptured) {
      this.onMessageCaptured(clean);
    }
  }

  // Odblokowuje AudioContext i element Audio w geście użytkownika (wymóg iOS Safari / Chrome)
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
      this.currentAudio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      await this.currentAudio.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  // Uzyskuje i utrzymuje ciągły strumień mikrofonu
  public async getOrCreateMediaStream(): Promise<MediaStream | null> {
    if (this.mediaStream && this.mediaStream.active) {
      const tracks = this.mediaStream.getAudioTracks();
      if (tracks.length > 0 && tracks[0].readyState === "live") {
        return this.mediaStream;
      }
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

      if (!this.audioContext || this.audioContext.state === "closed") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }

      if (this.audioContext) {
        try {
          if (this.audioContext.state === "suspended") {
            await this.audioContext.resume();
          }
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 512;
          this.analyser.smoothingTimeConstant = 0.2;
          source.connect(this.analyser);
        } catch (err) {
          console.warn("Analyser setup warning:", err);
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

  // Natywne rozpoznawanie mowy w przeglądarce (iOS Safari / Chrome / Android)
  private initNativeSpeechRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "pl-PL";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        if (this.isCurrentlySpeaking || this.isMutedForPlayback) return;

        let interimStr = "";
        let finalStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript + " ";
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (finalStr.trim().length > 1) {
          if (this.nativeInterimTimer) {
            clearTimeout(this.nativeInterimTimer);
            this.nativeInterimTimer = null;
          }
          this.handleCapturedSpeech(finalStr.trim());
        } else if (interimStr.trim().length > 1) {
          this.lastNativeInterimText = interimStr.trim();
          this.notifyState(null, 0.4);

          // Na urządzeniach mobilnych (iOS/Android), gdzie isFinal bywa opóźnione:
          if (this.nativeInterimTimer) clearTimeout(this.nativeInterimTimer);
          this.nativeInterimTimer = setTimeout(() => {
            if (this.lastNativeInterimText && this.lastNativeInterimText.length > 1) {
              this.handleCapturedSpeech(this.lastNativeInterimText);
              this.lastNativeInterimText = "";
            }
          }, 800);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Native SpeechRecognition error:", e.error);
        }
      };

      recognition.onend = () => {
        if (this.isContinuousMode && !this.isCurrentlySpeaking && !this.isMutedForPlayback) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      this.speechRecognition = recognition;
    } catch (err) {
      console.warn("Could not start SpeechRecognition:", err);
    }
  }

  // Rozpoczyna tryb ciągłego dialogu
  public async startLiveDialogue() {
    await this.unlock();
    this.isContinuousMode = true;
    this.currentTranscript = "";
    this.lastNativeInterimText = "";

    const stream = await this.getOrCreateMediaStream();
    if (!stream) return;

    this.startVoiceActivityDetection();
    this.initNativeSpeechRecognition();
    this.notifyState();
  }

  // Pętla monitorowania poziomu głosu (RMS VAD - niezawodna na każdym mikrofonie)
  private startVoiceActivityDetection() {
    if (this.volumeCheckAnimationId) {
      cancelAnimationFrame(this.volumeCheckAnimationId);
    }

    const checkVolume = () => {
      if (!this.isContinuousMode) return;

      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      // Badamy mikrofon, gdy lektor nie mówi i nie trwa transkrypcja
      if (
        this.analyser &&
        !this.isCurrentlySpeaking &&
        !this.isMutedForPlayback &&
        !this.isProcessingTranscript
      ) {
        const timeData = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(timeData);

        // Obliczenie energii RMS z sygnału czasowego (standard akustyczny)
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const val = (timeData[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / timeData.length);
        const normalizedVolume = Math.min(1, rms * 18);

        // Czuły, uniwersalny próg detekcji mowy człowieka (RMS > 0.015)
        const isUserSpeaking = rms > 0.015;

        if (isUserSpeaking) {
          this.consecutiveVoiceFrames++;
          if (this.consecutiveVoiceFrames >= 2) {
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
              }, 600);
            }
          }
        }

        if (this.onStateChange) {
          this.notifyState(null, normalizedVolume);
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
      const isWebmSupported = MediaRecorder.isTypeSupported("audio/webm;codecs=opus");
      const isMp4Supported = MediaRecorder.isTypeSupported("audio/mp4");
      const options = isWebmSupported
        ? { mimeType: "audio/webm;codecs=opus" }
        : isMp4Supported
        ? { mimeType: "audio/mp4" }
        : undefined;

      this.mediaRecorder = options
        ? new MediaRecorder(this.mediaStream, options)
        : new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start();
      this.isCurrentlyRecording = true;
      this.hasSpokenInCurrentChunk = false;
      this.notifyState();
    } catch (e) {
      console.warn("MediaRecorder start error:", e);
    }
  }

  private async stopAndTranscribeCurrentChunk() {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") return;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    const recorder = this.mediaRecorder;

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        this.isCurrentlyRecording = false;
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];

        if (audioBlob.size < 150 || !this.hasSpokenInCurrentChunk) {
          this.notifyState();
          resolve();
          return;
        }

        this.isProcessingTranscript = true;
        this.notifyState();

        try {
          const isMp4 =
            mimeType.toLowerCase().includes("mp4") ||
            mimeType.toLowerCase().includes("aac") ||
            mimeType.toLowerCase().includes("m4a");
          const filename = isMp4 ? "audio.mp4" : "audio.webm";

          const formData = new FormData();
          formData.append("file", audioBlob, filename);

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const text = (data.text || "").trim();
            if (text && text.length > 1) {
              this.handleCapturedSpeech(text);
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
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      } catch {
        this.isCurrentlyRecording = false;
        this.notifyState();
        resolve();
      }
    });
  }

  // Wymuszenie natychmiastowego wysłania bieżącej wypowiedzi
  public forceFinishSpeakingAndSend() {
    if (this.isCurrentlyRecording) {
      this.stopAndTranscribeCurrentChunk();
    }
  }

  // Ręczne rozpoczęcie nagrywania (Tap-to-Speak)
  public async startManualRecording(): Promise<boolean> {
    await this.unlock();
    this.stopSpeaking();

    const stream = await this.getOrCreateMediaStream();
    if (!stream) return false;

    this.audioChunks = [];
    this.currentTranscript = "";

    try {
      const isWebmSupported = MediaRecorder.isTypeSupported("audio/webm;codecs=opus");
      const isMp4Supported = MediaRecorder.isTypeSupported("audio/mp4");
      const options = isWebmSupported
        ? { mimeType: "audio/webm;codecs=opus" }
        : isMp4Supported
        ? { mimeType: "audio/mp4" }
        : undefined;

      this.mediaRecorder = options
        ? new MediaRecorder(stream, options)
        : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start();
      this.isCurrentlyRecording = true;
      this.notifyState();
      return true;
    } catch (err: any) {
      this.notifyState("Nie udało się uruchomić nagrywania.");
      return false;
    }
  }

  // Zatrzymanie nagrywania ręcznego i transkrypcja
  public async stopManualRecording(): Promise<string | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
      this.isCurrentlyRecording = false;
      this.notifyState();
      return null;
    }

    const recorder = this.mediaRecorder;

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        this.isCurrentlyRecording = false;
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];

        if (audioBlob.size < 150) {
          this.notifyState();
          resolve(null);
          return;
        }

        this.isProcessingTranscript = true;
        this.notifyState();

        try {
          const isMp4 =
            mimeType.toLowerCase().includes("mp4") ||
            mimeType.toLowerCase().includes("aac") ||
            mimeType.toLowerCase().includes("m4a");
          const filename = isMp4 ? "audio.mp4" : "audio.webm";

          const formData = new FormData();
          formData.append("file", audioBlob, filename);

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            this.notifyState("Błąd rozpoznawania głosu.");
            resolve(null);
            return;
          }

          const data = await res.json();
          const text = (data.text || "").trim();

          if (text) {
            this.handleCapturedSpeech(text);
          }
          resolve(text);
        } catch (err: any) {
          console.error("Transcribe request error:", err);
          this.notifyState("Błąd połączenia podczas transkrypcji.");
          resolve(null);
        } finally {
          this.isProcessingTranscript = false;
          this.notifyState();
        }
      };

      try {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      } catch {
        this.isCurrentlyRecording = false;
        this.notifyState();
        resolve(null);
      }
    });
  }

  public async stopManualRecordingAndTranscribe(): Promise<string | null> {
    return this.stopManualRecording();
  }

  // Odtwarzanie głosu lektora (TTS) z natychmiastowym wznowieniem nasłuchu
  public async speak(
    text: string,
    onEnded?: () => void,
    voice: string = "nova",
    skipIfBusy = false
  ): Promise<boolean> {
    if (!text || text.trim().length === 0) return false;

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

      await this.unlock();
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.preload = "auto";
      this.currentAudio = audio;

      return new Promise((resolve) => {
        let isCleanedUp = false;

        const cleanup = (success: boolean) => {
          if (isCleanedUp) return;
          isCleanedUp = true;
          this.isCurrentlySpeaking = false;
          this.isMutedForPlayback = false;
          try {
            URL.revokeObjectURL(audioUrl);
          } catch {}

          this.notifyState();
          if (this.speechRecognition) {
            try {
              this.speechRecognition.start();
            } catch {}
          }
          if (onEnded) onEnded();
          resolve(success);
        };

        audio.onended = () => cleanup(true);
        audio.onerror = () => cleanup(false);

        // Failsafe timeout: maksymalnie 12 sekund na pojedynczą wypowiedź
        const maxDurationMs = Math.min(12000, Math.max(3500, text.length * 80));
        setTimeout(() => {
          cleanup(true);
        }, maxDurationMs);

        audio.play().catch(() => cleanup(false));
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
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isCurrentlySpeaking = false;
    this.isMutedForPlayback = false;
    this.notifyState();
  }

  public stopLiveDialogue() {
    this.isContinuousMode = false;
    this.isCurrentlyRecording = false;
    this.isMutedForPlayback = false;
    this.hasSpokenInCurrentChunk = false;

    if (this.volumeCheckAnimationId) {
      cancelAnimationFrame(this.volumeCheckAnimationId);
      this.volumeCheckAnimationId = null;
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.nativeInterimTimer) {
      clearTimeout(this.nativeInterimTimer);
      this.nativeInterimTimer = null;
    }
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {}
      this.speechRecognition = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    this.stopSpeaking();
    this.notifyState();
  }
}

export const voiceEngine = new VoiceEngine();
