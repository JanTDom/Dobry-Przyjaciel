"use client";

export interface VoiceState {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
}

class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isContinuousMode: boolean = false;
  private silenceTimer: any = null;
  private onMessageCaptured: ((text: string) => void) | null = null;
  private onStateChange: ((state: { isListening: boolean; isSpeaking: boolean; transcript: string }) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        this.synth = window.speechSynthesis;
      }
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "pl-PL";
        this.setupRecognitionListeners();
      }
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
          transcript: activeText,
        });
      }

      if (activeText.length > 2) {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          if (activeText.length > 1 && this.onMessageCaptured) {
            const captured = activeText;
            this.onMessageCaptured(captured);
          }
        }, 1300);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn("Speech recognition notice:", event.error);
    };

    this.recognition.onend = () => {
      if (this.isContinuousMode && !this.isSpeakingNow()) {
        try {
          this.recognition.start();
        } catch {
          // Ignored
        }
      }
    };
  }

  private isSpeakingNow(): boolean {
    if (this.currentAudio && !this.currentAudio.paused) return true;
    if (this.synth && this.synth.speaking) return true;
    return false;
  }

  public setCallbacks(
    onMessage: (text: string) => void,
    onState: (state: { isListening: boolean; isSpeaking: boolean; transcript: string }) => void
  ) {
    this.onMessageCaptured = onMessage;
    this.onStateChange = onState;
  }

  public startLiveDialogue() {
    this.isContinuousMode = true;
    this.stopSpeaking();
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        // Ignored
      }
      if (this.onStateChange) {
        this.onStateChange({ isListening: true, isSpeaking: false, transcript: "" });
      }
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
    this.stopSpeaking();
    if (this.onStateChange) {
      this.onStateChange({ isListening: false, isSpeaking: false, transcript: "" });
    }
  }

  public async speak(text: string, onEnd?: () => void, voiceName: string = "nova") {
    this.stopSpeaking();

    if (this.recognition && this.isContinuousMode) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
    }

    if (this.onStateChange) {
      this.onStateChange({ isListening: false, isSpeaking: true, transcript: "" });
    }

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voiceName }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        audio.onended = () => {
          this.handlePlaybackEnd(onEnd);
        };

        audio.onerror = () => {
          this.speakWithLocalFallback(text, onEnd, voiceName);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback
    }

    this.speakWithLocalFallback(text, onEnd, voiceName);
  }

  private speakWithLocalFallback(text: string, onEnd?: () => void, voiceName: string = "nova") {
    if (!this.synth) {
      this.handlePlaybackEnd(onEnd);
      return;
    }

    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = 0.94;
    utterance.pitch = voiceName === "echo" || voiceName === "onyx" ? 0.85 : 0.98;

    const voices = this.synth.getVoices();
    const isMale = voiceName === "echo" || voiceName === "onyx";

    const polishVoice = isMale
      ? voices.find((v) => v.lang.startsWith("pl") && (v.name.includes("Jan") || v.name.includes("Marek") || v.name.includes("Male"))) || voices.find((v) => v.lang.startsWith("pl"))
      : voices.find((v) => v.lang.startsWith("pl") && (v.name.includes("Zosia") || v.name.includes("Maja") || v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Paulina"))) || voices.find((v) => v.lang.startsWith("pl"));

    if (polishVoice) utterance.voice = polishVoice;

    utterance.onend = () => {
      this.handlePlaybackEnd(onEnd);
    };

    utterance.onerror = () => {
      this.handlePlaybackEnd(onEnd);
    };

    this.synth.speak(utterance);
  }

  private handlePlaybackEnd(onEnd?: () => void) {
    if (this.onStateChange) {
      this.onStateChange({ isListening: this.isContinuousMode, isSpeaking: false, transcript: "" });
    }
    if (this.isContinuousMode && this.recognition) {
      setTimeout(() => {
        try {
          this.recognition.start();
        } catch {
          // Ignored
        }
      }, 300);
    }
    if (onEnd) onEnd();
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceEngine = typeof window !== "undefined" ? new VoiceEngine() : ({} as VoiceEngine);
