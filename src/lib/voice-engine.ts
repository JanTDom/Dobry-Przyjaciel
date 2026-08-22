class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private onSpeakStateChange?: (speaking: boolean) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public registerStateListener(cb: (speaking: boolean) => void) {
    this.onSpeakStateChange = cb;
  }

  public speak(text: string, onEnd?: () => void, onBoundary?: (charIndex: number) => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.92; // Slightly slower, calm, measured cadence
    utterance.pitch = 1.02; // Warm, natural presence

    // Try finding the best soothing Polish voice available on the system
    const voices = this.synth.getVoices();
    const polishVoice = voices.find(v => v.lang.startsWith('pl') && (v.name.includes('Zosia') || v.name.includes('Ewa') || v.name.includes('Maja') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Paulina'))) ||
      voices.find(v => v.lang.startsWith('pl'));

    if (polishVoice) {
      utterance.voice = polishVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onSpeakStateChange) this.onSpeakStateChange(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onSpeakStateChange) this.onSpeakStateChange(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onSpeakStateChange) this.onSpeakStateChange(false);
      if (onEnd) onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (e) => {
        onBoundary(e.charIndex);
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    if (this.onSpeakStateChange) this.onSpeakStateChange(false);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceEngine = typeof window !== 'undefined' ? new VoiceEngine() : null;
