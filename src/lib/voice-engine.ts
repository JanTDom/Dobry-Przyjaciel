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

  // Jeden element Audio przez cały cykl życia singletonu — iOS wymaga reużycia
  private currentAudio: HTMLAudioElement | null = null;
  private _currentAudioUrl: string | null = null;
  private _audioUnlocked = false;
  // Blokada podwójnego getUserMedia (race condition)
  private _mediaStreamPending: Promise<MediaStream | null> | null = null;

  private isContinuousMode = false;
  private isCurrentlyRecording = false;
  private isCurrentlySpeaking = false;
  private isProcessingTranscript = false;
  private isMutedForPlayback = false;

  private volumeCheckAnimationId: number | null = null;
  private silenceTimer: any = null;
  private consecutiveVoiceFrames = 0;
  private hasSpokenInCurrentChunk = false;

  private speechRecognition: any = null;
  private lastCapturedTimestamp = 0;
  private lastCapturedText = "";
  private nativeInterimTimer: any = null;
  private lastNativeInterimText = "";

  private onMessageCaptured: ((text: string) => void) | null = null;
  private onStateChange: ((state: VoiceEngineState) => void) | null = null;
  private currentTranscript = "";

  constructor() {
    if (typeof window !== "undefined") {
      this.currentAudio = new Audio();
    }
  }

  private notifyState(errorMessage: string | null = null, currentVolume = 0) {
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

  private handleCapturedSpeech(text: string) {
    const clean = text.trim();
    if (!clean || clean.length < 2) return;
    const now = Date.now();
    if (
      this.lastCapturedText.toLowerCase() === clean.toLowerCase() &&
      now - this.lastCapturedTimestamp < 2500
    ) return;

    this.lastCapturedText = clean;
    this.lastCapturedTimestamp = now;
    this.currentTranscript = clean;
    this.hasSpokenInCurrentChunk = false;
    this.lastNativeInterimText = "";

    if (this.isCurrentlySpeaking) {
      this.stopSpeaking();
    }
    if (this.onMessageCaptured) {
      this.onMessageCaptured(clean);
    }
  }

  // ─── UNLOCK ────────────────────────────────────────────────────────────────
  // Wywołać SYNCHRONICZNIE w obsłudze kliknięcia (gestu użytkownika).
  // Idempotentny — nie resetuje audio elementu jeśli już odblokowany.
  public async unlock(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      // AudioContext — BEZ wymuszania sampleRate (iOS działa na 48kHz system rate)
      if (!this.audioContext || this.audioContext.state === "closed") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (this.audioContext?.state === "suspended") {
        await this.audioContext.resume();
      }

      // Element Audio — odblokuj tylko raz gestem, potem reużywaj bez resetu src
      if (!this._audioUnlocked) {
        if (!this.currentAudio) this.currentAudio = new Audio();
        this.currentAudio.src =
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
        await this.currentAudio.play().catch(() => {});
        this._audioUnlocked = true;
      }
      return true;
    } catch {
      return false;
    }
  }

  // ─── MIKROFON ──────────────────────────────────────────────────────────────
  // Zabezpieczenie przed podwójnym getUserMedia (race condition)
  public async getOrCreateMediaStream(): Promise<MediaStream | null> {
    if (this.mediaStream?.active) {
      const tracks = this.mediaStream.getAudioTracks();
      if (tracks.length > 0 && tracks[0].readyState === "live") return this.mediaStream;
    }

    // Jeśli już czekamy na pozwolenie — zwróć tę samą obietnicę (nie pytaj dwa razy)
    if (this._mediaStreamPending) return this._mediaStreamPending;

    this._mediaStreamPending = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            // autoGainControl wyłączone — AGC obniża sygnał do wartości nie wykrywalnych przez VAD
            autoGainControl: false,
          },
        });
        this.mediaStream = stream;

        // Podłącz analyser — BEZ wymuszania sampleRate (musi pasować do strumienia)
        try {
          if (!this.audioContext || this.audioContext.state === "closed") {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) this.audioContext = new AudioCtx();
          }
          if (this.audioContext?.state === "suspended") {
            this.audioContext.resume().catch(() => {});
          }
          if (this.audioContext) {
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.1;
            source.connect(this.analyser);
          }
        } catch (err) {
          console.warn("Analyser setup error:", err);
          // analyser będzie null — VAD nie zadziała, ale SpeechRecognition tak
        }

        return stream;
      } catch (err) {
        console.error("Microphone access error:", err);
        this.notifyState("Brak dostępu do mikrofonu. Zezwól na dostęp w przeglądarce.");
        return null;
      } finally {
        this._mediaStreamPending = null;
      }
    })();

    return this._mediaStreamPending;
  }

  public setCallbacks(
    onMessage: (text: string) => void,
    onState: (state: VoiceEngineState) => void
  ) {
    this.onMessageCaptured = onMessage;
    this.onStateChange = onState;
  }

  // ─── SPEECH RECOGNITION ────────────────────────────────────────────────────
  private initNativeSpeechRecognition() {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.log("SpeechRecognition not available — using MediaRecorder+Whisper only");
      return;
    }

    try {
      if (this.speechRecognition) {
        try { this.speechRecognition.stop(); } catch {}
      }

      const recognition = new SR();
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
          if (this.nativeInterimTimer) clearTimeout(this.nativeInterimTimer);
          this.nativeInterimTimer = setTimeout(() => {
            if (this.lastNativeInterimText?.length > 1) {
              this.handleCapturedSpeech(this.lastNativeInterimText);
              this.lastNativeInterimText = "";
            }
          }, 800);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("SpeechRecognition error:", e.error);
        }
      };

      recognition.onend = () => {
        if (this.isContinuousMode && !this.isCurrentlySpeaking && !this.isMutedForPlayback) {
          try { recognition.start(); } catch {}
        }
      };

      recognition.start();
      this.speechRecognition = recognition;
    } catch (err) {
      console.warn("Could not start SpeechRecognition:", err);
    }
  }

  // ─── START DIALOGUE ────────────────────────────────────────────────────────
  public async startLiveDialogue() {
    this.isContinuousMode = true;
    this.currentTranscript = "";
    this.lastNativeInterimText = "";

    const stream = await this.getOrCreateMediaStream();
    if (!stream) return;

    this.startVoiceActivityDetection();
    this.initNativeSpeechRecognition();
    this.notifyState();
  }

  // ─── VAD (Voice Activity Detection) ───────────────────────────────────────
  private startVoiceActivityDetection() {
    if (this.volumeCheckAnimationId) {
      cancelAnimationFrame(this.volumeCheckAnimationId);
    }

    const checkVolume = () => {
      if (!this.isContinuousMode) return;

      if (this.audioContext?.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      if (
        this.analyser &&
        !this.isCurrentlySpeaking &&
        !this.isMutedForPlayback &&
        !this.isProcessingTranscript
      ) {
        const timeData = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(timeData);

        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const val = (timeData[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / timeData.length);
        const normalizedVolume = Math.min(1, rms * 20);

        // Niższy próg (0.010) — lepsza czułość dla telefonów z wyłączonym AGC
        const isUserSpeaking = rms > 0.010;

        if (isUserSpeaking) {
          this.consecutiveVoiceFrames++;
          if (this.consecutiveVoiceFrames >= 2) {
            if (!this.isCurrentlyRecording) this.startRecordingChunk();
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

        if (this.onStateChange) this.notifyState(null, normalizedVolume);
      }

      this.volumeCheckAnimationId = requestAnimationFrame(checkVolume);
    };

    this.volumeCheckAnimationId = requestAnimationFrame(checkVolume);
  }

  // ─── MEDIA RECORDER ────────────────────────────────────────────────────────
  private startRecordingChunk() {
    if (
      !this.mediaStream ||
      this.isCurrentlyRecording ||
      this.isCurrentlySpeaking ||
      this.isMutedForPlayback
    ) return;

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
        if (e.data?.size > 0) this.audioChunks.push(e.data);
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

          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            const text = (data.text || "").trim();
            if (text?.length > 1) this.handleCapturedSpeech(text);
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
        if (recorder.state !== "inactive") recorder.stop();
      } catch {
        this.isCurrentlyRecording = false;
        this.notifyState();
        resolve();
      }
    });
  }

  public forceFinishSpeakingAndSend() {
    if (this.isCurrentlyRecording) this.stopAndTranscribeCurrentChunk();
  }

  // ─── MANUAL RECORDING (tap-to-speak) ──────────────────────────────────────
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
        if (e.data?.size > 0) this.audioChunks.push(e.data);
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
          const isMp4 = mimeType.toLowerCase().includes("mp4") || mimeType.toLowerCase().includes("m4a");
          const filename = isMp4 ? "audio.mp4" : "audio.webm";
          const formData = new FormData();
          formData.append("file", audioBlob, filename);

          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (!res.ok) { resolve(null); return; }
          const data = await res.json();
          const text = (data.text || "").trim();
          if (text) this.handleCapturedSpeech(text);
          resolve(text);
        } catch {
          resolve(null);
        } finally {
          this.isProcessingTranscript = false;
          this.notifyState();
        }
      };

      try {
        if (recorder.state !== "inactive") recorder.stop();
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

  // ─── TTS SPEAK ─────────────────────────────────────────────────────────────
  // iOS Safari: reużywamy JEDEN element Audio odblokowany gestem.
  // Nigdy nie tworzymy new Audio() po async operacji — iOS blokuje play().
  public async speak(
    text: string,
    onEnded?: () => void,
    voice = "nova",
    skipIfBusy = false
  ): Promise<boolean> {
    if (!text?.trim()) return false;
    
    if (!this.currentAudio) this.currentAudio = new Audio();

    this.isMutedForPlayback = true;
    if (this.isCurrentlyRecording && this.mediaRecorder) {
      try { this.mediaRecorder.stop(); } catch {}
      this.isCurrentlyRecording = false;
    }
    this._pauseAudio();
    this.isCurrentlySpeaking = true;
    this.notifyState();

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voice: voice || "nova" }),
      });

      if (!res.ok) {
        this.isCurrentlySpeaking = false;
        this.isMutedForPlayback = false;
        this.notifyState();
        onEnded?.();
        return false;
      }

      const blob = await res.blob();

      const prevUrl = this._currentAudioUrl;
      const audioUrl = URL.createObjectURL(blob);
      this._currentAudioUrl = audioUrl;

      // Podmień src na odblokowanym elemencie — nie twórz nowego
      this.currentAudio.pause();
      this.currentAudio.src = audioUrl;
      // NIE wywołuj .load() — powoduje trzaski na iOS

      if (prevUrl) {
        try { URL.revokeObjectURL(prevUrl); } catch {}
      }

      return new Promise((resolve) => {
        let done = false;
        const audio = this.currentAudio!;

        const cleanup = (success: boolean) => {
          if (done) return;
          done = true;
          clearTimeout(failsafe);
          this.isCurrentlySpeaking = false;
          this.isMutedForPlayback = false;
          this.notifyState();
          if (this.speechRecognition) {
            try { this.speechRecognition.start(); } catch {}
          }
          onEnded?.();
          resolve(success);
        };

        audio.onended = () => cleanup(true);
        audio.onerror = (e) => {
          console.warn("Audio error:", e);
          cleanup(false);
        };

        // Failsafe: ~110ms/znak + 5s bufor — gwarantuje odblokowanie mikrofonu
        const maxMs = Math.min(18000, Math.max(5000, text.length * 110));
        const failsafe = setTimeout(() => cleanup(true), maxMs);

        audio.play().catch((err) => {
          console.warn("audio.play() rejected:", err);
          clearTimeout(failsafe);
          cleanup(false);
        });
      });
    } catch (err) {
      console.error("Speak error:", err);
      this.isCurrentlySpeaking = false;
      this.isMutedForPlayback = false;
      this.notifyState();
      onEnded?.();
      return false;
    }
  }

  private _pauseAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
    }
  }

  public stopSpeaking() {
    this._pauseAudio();
    this.isCurrentlySpeaking = false;
    this.isMutedForPlayback = false;
    this.notifyState();
  }

  // ─── STOP ──────────────────────────────────────────────────────────────────
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
      try { this.speechRecognition.stop(); } catch {}
      this.speechRecognition = null;
    }
    if (this.mediaRecorder?.state !== "inactive") {
      try { this.mediaRecorder?.stop(); } catch {}
    }
    this.stopSpeaking();
    this.notifyState();
  }
}

export const voiceEngine = new VoiceEngine();
