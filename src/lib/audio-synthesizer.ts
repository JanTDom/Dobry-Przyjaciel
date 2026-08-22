import { AmbientSoundType } from '@/types';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isRunning: boolean = false;
  private currentVolume: number = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  public stop() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
    }
    setTimeout(() => {
      this.cleanupNodes();
      this.currentType = 'none';
      this.isRunning = false;
    }, 450);
  }

  private cleanupNodes() {
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore already disconnected
        }
      }
    });
    this.activeNodes = [];
  }

  public play(type: AmbientSoundType) {
    if (type === 'none') {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.cleanupNodes();
    this.currentType = type;
    this.isRunning = true;
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.8);

    switch (type) {
      case 'rain':
        this.startRainSynth();
        break;
      case 'ocean':
        this.startOceanSynth();
        break;
      case 'alpha_drone':
        this.startAlphaDroneSynth();
        break;
      case 'night_forest':
        this.startNightForestSynth();
        break;
    }
  }

  // --- Rain Generator ---
  private startRainSynth() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  // --- Ocean Wave Synth ---
  private startOceanSynth() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const oceanGain = this.ctx.createGain();
    oceanGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    // LFO to create rhythmic breathing tide (approx 0.1 Hz, 10s wave period)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(oceanGain);
    oceanGain.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();

    this.activeNodes.push(whiteNoise, filter, oceanGain, lfo, lfoGain);
  }

  // --- Alpha Drone 8Hz Binaural Synth ---
  private startAlphaDroneSynth() {
    if (!this.ctx || !this.masterGain) return;
    const rootFreq = 108; // Deep meditative root
    const beatFreq = 8; // 8Hz Alpha state (calm focus & anxiety relief)

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(rootFreq, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(rootFreq + beatFreq, this.ctx.currentTime);

    // Warm overtone
    const oscWarm = this.ctx.createOscillator();
    oscWarm.type = 'triangle';
    oscWarm.frequency.setValueAtTime(rootFreq / 2, this.ctx.currentTime);

    const warmFilter = this.ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.setValueAtTime(200, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    oscLeft.connect(droneGain);
    oscRight.connect(droneGain);
    oscWarm.connect(warmFilter);
    warmFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    oscWarm.start();

    this.activeNodes.push(oscLeft, oscRight, oscWarm, warmFilter, droneGain);
  }

  // --- Night Forest Synth ---
  private startNightForestSynth() {
    if (!this.ctx || !this.masterGain) return;
    // Ambient night air
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const airGain = this.ctx.createGain();
    airGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(airGain);
    airGain.connect(this.masterGain);
    noise.start();

    // Gentle crickets
    const oscCricket = this.ctx.createOscillator();
    oscCricket.type = 'sine';
    oscCricket.frequency.setValueAtTime(4500, this.ctx.currentTime);

    const cricketGain = this.ctx.createGain();
    cricketGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    const lfoCricket = this.ctx.createOscillator();
    lfoCricket.type = 'sawtooth';
    lfoCricket.frequency.setValueAtTime(16, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.012, this.ctx.currentTime);
    lfoCricket.connect(lfoGain);
    lfoGain.connect(cricketGain.gain);

    oscCricket.connect(cricketGain);
    cricketGain.connect(this.masterGain);

    oscCricket.start();
    lfoCricket.start();

    this.activeNodes.push(noise, filter, airGain, oscCricket, cricketGain, lfoCricket, lfoGain);
  }
}

export const ambientEngine = typeof window !== 'undefined' ? new AmbientAudioEngine() : null;
