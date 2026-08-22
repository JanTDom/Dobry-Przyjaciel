// Web Audio API procedural atmospheric sound synthesizer - Czysty, miękki i bez trzasków

export type SoundscapeType = "fireplace" | "rain" | "ocean" | "alpha_waves" | "forest";

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isMuted: boolean = false;
  private currentVolume: number = 0.3;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.currentVolume);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentType(): SoundscapeType | null {
    return this.currentType;
  }

  public stop() {
    if (this.ctx) {
      this.activeNodes.forEach(item => {
        if (typeof item === "number") {
          clearInterval(item);
        } else {
          try {
            if ("stop" in item && typeof (item as AudioScheduledSourceNode).stop === "function") {
              (item as AudioScheduledSourceNode).stop();
            }
            item.disconnect();
          } catch {
            // Ignored
          }
        }
      });
      this.activeNodes = [];
    }
    this.currentType = null;
  }

  public play(type: SoundscapeType) {
    if (this.currentType === type) {
      this.stop();
      return;
    }

    this.initContext();
    this.stop();
    this.currentType = type;

    if (!this.ctx || !this.masterGain) return;

    switch (type) {
      case "fireplace":
        this.playFireplace();
        break;
      case "rain":
        this.playRain();
        break;
      case "ocean":
        this.playOcean();
        break;
      case "alpha_waves":
        this.playAlphaWaves();
        break;
      case "forest":
        this.playForest();
        break;
    }
  }

  // 1. Ciepłe, miękkie tło kominka (Czysty, ciepły szum bez jakichkolwiek trzasków czy klików)
  private playFireplace() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const baseNoise = this.ctx.createBufferSource();
    baseNoise.buffer = noiseBuffer;
    baseNoise.loop = true;

    const baseFilter = this.ctx.createBiquadFilter();
    baseFilter.type = "lowpass";
    baseFilter.frequency.setValueAtTime(240, this.ctx.currentTime);

    const baseGain = this.ctx.createGain();
    baseGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    baseNoise.connect(baseFilter);
    baseFilter.connect(baseGain);
    baseGain.connect(this.masterGain);
    baseNoise.start();

    this.activeNodes.push(baseNoise, baseFilter, baseGain);
  }

  // 2. Kojący Ciepły Deszcz
  private playRain() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    rainSource.start();

    this.activeNodes.push(rainSource, filter, gain);
  }

  // 3. Fale Oceanu
  private playOcean() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, gain, lfo, lfoGain);
  }

  // 4. Fale Alfa 8Hz (Binaural Drone)
  private playAlphaWaves() {
    if (!this.ctx || !this.masterGain) return;

    const baseFreq = 160;
    const alphaDiff = 8;

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = "sine";
    oscLeft.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const panLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panLeft) panLeft.pan.setValueAtTime(-0.8, this.ctx.currentTime);

    const gainLeft = this.ctx.createGain();
    gainLeft.gain.setValueAtTime(0.15, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = "sine";
    oscRight.frequency.setValueAtTime(baseFreq + alphaDiff, this.ctx.currentTime);

    const panRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panRight) panRight.pan.setValueAtTime(0.8, this.ctx.currentTime);

    const gainRight = this.ctx.createGain();
    gainRight.gain.setValueAtTime(0.15, this.ctx.currentTime);

    if (panLeft && panRight) {
      oscLeft.connect(panLeft);
      panLeft.connect(gainLeft);
      oscRight.connect(panRight);
      panRight.connect(gainRight);
    } else {
      oscLeft.connect(gainLeft);
      oscRight.connect(gainRight);
    }

    gainLeft.connect(this.masterGain);
    gainRight.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.activeNodes.push(oscLeft, oscRight, gainLeft, gainRight);
  }

  // 5. Nocny Las
  private playForest() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);
    windSource.start();

    this.activeNodes.push(windSource, windFilter, windGain);
  }
}

export const soundscapeEngine = typeof window !== "undefined" ? new AudioSynthesizer() : ({} as AudioSynthesizer);
