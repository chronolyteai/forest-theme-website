/**
 * Web Audio API procedural soundscape engine.
 * - Ambient forest loop (stream + wind + songbirds + low sanctuary drone)
 * - Firefly hover shimmer chime with spatial stereo panning based on cursor position
 * - Scene click pentatonic crystal burst chime
 * - Real-time FFT energy analyzer
 * - Master gain control with exponential fading
 */

class ForestAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isRunning = false;
  private birdTimer: NodeJS.Timeout | null = null;
  private lastChimeTime = 0;
  private dataArray: Uint8Array | null = null;

  private initContext() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  // Create a 5-second looping pink noise buffer for river & wind
  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.153852;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.76160 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Continuous flowing shallow stream
  private setupStream(noiseBuffer: AudioBuffer) {
    if (!this.ctx || !this.masterGain) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = 480;
    filter1.Q.value = 2.2;

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 1200;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.2;
    lfoGain.gain.value = 160;
    lfo.connect(filter1.frequency);
    lfo.start();

    const streamGain = this.ctx.createGain();
    streamGain.gain.value = 0.22;

    source.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(streamGain);
    streamGain.connect(this.masterGain);

    source.start();
  }

  // Soft breeze through the dense canopy
  private setupWind(noiseBuffer: AudioBuffer) {
    if (!this.ctx || !this.masterGain) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;
    filter.Q.value = 0.7;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 120;
    lfo.connect(filter.frequency);
    lfo.start();

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.18;

    source.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);

    source.start();
  }

  // Low grounding sanctuary drone (55Hz sub + 110Hz warm 5th)
  private setupDrone() {
    if (!this.ctx || !this.masterGain) return;

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.14;

    const freqs = [55.0, 110.0, 164.81];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (idx - 1) * 3;

      gain.gain.value = 0.08 / (idx + 1);

      osc.connect(gain);
      gain.connect(droneGain);
      osc.start();
    });

    droneGain.connect(this.masterGain);
  }

  // Distant procedural songbird chirps
  private scheduleNextBirdChirp() {
    if (!this.isRunning) return;
    const delay = 4500 + Math.random() * 6500;
    this.birdTimer = setTimeout(() => {
      this.playBirdChirp();
      this.scheduleNextBirdChirp();
    }, delay);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    const now = this.ctx.currentTime;
    const notesCount = 2 + Math.floor(Math.random() * 3);
    const baseFreq = 2200 + Math.random() * 600;

    for (let i = 0; i < notesCount; i++) {
      const chirpTime = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startF = baseFreq + (Math.random() - 0.5) * 300;
      const endF = startF + (Math.random() > 0.5 ? -500 : 400);

      osc.frequency.setValueAtTime(startF, chirpTime);
      osc.frequency.exponentialRampToValueAtTime(endF, chirpTime + 0.06);

      gain.gain.setValueAtTime(0, chirpTime);
      gain.gain.linearRampToValueAtTime(0.035, chirpTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, chirpTime + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(chirpTime);
      osc.stop(chirpTime + 0.075);
    }
  }

  // Subtle firefly shimmer chime panned by cursor position (-1 to 1)
  public playFireflyChime(panX = 0) {
    if (!this.ctx || !this.masterGain) return;
    const now = performance.now();
    if (now - this.lastChimeTime < 120) return;
    this.lastChimeTime = now;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const frequencies = [880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    if (typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, panX));
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      osc.connect(gain);
      gain.connect(this.masterGain);
    }

    osc.start(t);
    osc.stop(t + 0.5);
  }

  // Scene click burst chime: pentatonic arpeggio
  public playBurstChime() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const notes = [587.33, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.9);
    });
  }

  // Returns normalized energy (0 to 1) for the spirit creature heartbeat and vignette breathing
  public getEnergy(): number {
    if (!this.analyser || !this.dataArray || !this.isRunning) {
      const t = performance.now() * 0.0018;
      return 0.35 + Math.sin(t) * 0.15 + Math.sin(t * 2.3) * 0.08;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    const bins = Math.min(16, this.dataArray.length);
    for (let i = 0; i < bins; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / (bins * 255);
    return Math.max(0.2, Math.min(1.0, avg * 1.8 + 0.25));
  }

  public async start() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.isRunning) {
      this.isRunning = true;
      const noiseBuffer = this.createPinkNoiseBuffer();
      this.setupStream(noiseBuffer);
      this.setupWind(noiseBuffer);
      this.setupDrone();
      this.scheduleNextBirdChirp();
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.85, now + 1.2);
  }

  public stop() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
  }
}

export const forestAudio =
  typeof window !== 'undefined' ? new ForestAudioEngine() : ({} as ForestAudioEngine);
