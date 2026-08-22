"use client";

// Speech synthesis and continuous real-time voice recognition

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
  private currentUtterance: SpeechSynthesisUtterance | null = null;
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
        // Reset silence timer on every new speech token
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          if (activeText.length > 1 && this.onMessageCaptured) {
            const captured = activeText;
            this.onMessageCaptured(captured);
          }
        }, 1400); // 1.4s pause triggers companion response in live mode
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn("Speech recognition notice:", event.error);
    };

    this.recognition.onend = () => {
      // Auto-restart if we are in live hands-free mode and not speaking
      if (this.isContinuousMode && (!this.synth || !this.synth.speaking)) {
        try {
          this.recognition.start();
        } catch {
          // Ignored
        }
      }
    };
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
    if (this.synth) this.synth.cancel();
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        // Already started
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
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.onStateChange) {
      this.onStateChange({ isListening: false, isSpeaking: false, transcript: "" });
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Temporarily pause recognition while speaking to prevent echo
    if (this.recognition && this.isContinuousMode) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = 0.94; // Calm, thoughtful pace
    utterance.pitch = 0.98; // Warm, gentle pitch

    const voices = this.synth.getVoices();
    const polishVoice = voices.find((v) => v.lang.startsWith("pl") && (v.name.includes("Zosia") || v.name.includes("Maja") || v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Paulina") || v.name.includes("Ewa"))) ||
      voices.find((v) => v.lang.startsWith("pl"));

    if (polishVoice) {
      utterance.voice = polishVoice;
    }

    utterance.onstart = () => {
      if (this.onStateChange) {
        this.onStateChange({ isListening: false, isSpeaking: true, transcript: "" });
      }
    };

    utterance.onend = () => {
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
    };

    utterance.onerror = () => {
      if (this.onStateChange) {
        this.onStateChange({ isListening: this.isContinuousMode, isSpeaking: false, transcript: "" });
      }
      if (this.isContinuousMode && this.recognition) {
        try {
          this.recognition.start();
        } catch {
          // Ignored
        }
      }
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceEngine = typeof window !== "undefined" ? new VoiceEngine() : ({} as VoiceEngine);
