/**
 * Web Audio API procedural soundscape engine for Sylvane Forest.
 * Generates an authentic ambient forest environment completely in-browser:
 * - Flowing mountain stream (filtered pink noise modulated by dual LFOs)
 * - Soft canopy wind rustle
 * - Distant mystical bird chirps (frequency-modulated sweeps)
 * - Warm ethereal sanctuary drone (detuned harmonic sines)
 * - Interactive firefly chime bursts (pentatonic arpeggio on click)
 * - Real-time FFT energy analyzer driving the spirit creature's heartbeat
 */

class ForestAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isRunning = false;
  private birdTimer: NodeJS.Timeout | null = null;
  private dataArray: Uint8Array | null = null;

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
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

    // Dual bandpass filters to simulate gurgling water ripples
    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = 520;
    filter1.Q.value = 2.5;

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 1400;

    // LFO modulating the river filter frequency for natural water flow variation
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.25; // 4 second swell cycle
    lfoGain.gain.value = 180;
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

  // Soft breeze through the pine & oak canopy
  private setupWind(noiseBuffer: AudioBuffer) {
    if (!this.ctx || !this.masterGain) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 0.8;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.08; // 12 second gentle gust cycle
    lfoGain.gain.value = 140;
    lfo.connect(filter.frequency);
    lfo.start();

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.16;

    source.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);

    source.start();
  }

  // Mystical warm sanctuary drone (55Hz sub + 110Hz warm 5th + 220Hz sparkle)
  private setupSanctuaryDrone() {
    if (!this.ctx || !this.masterGain) return;

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.12;

    const freqs = [55.0, 110.0, 164.81, 220.0];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      // Slight detune for lush organic chorus
      osc.detune.value = (idx - 1.5) * 4;

      gain.gain.value = 0.08 / (idx + 1);

      // Low frequency tremolo
      const tremolo = this.ctx.createOscillator();
      const tremoloGain = this.ctx.createGain();
      tremolo.frequency.value = 0.12 + idx * 0.04;
      tremoloGain.gain.value = 0.02;
      tremolo.connect(gain.gain);
      tremolo.start();

      osc.connect(gain);
      gain.connect(droneGain);
      osc.start();
    });

    droneGain.connect(this.masterGain);
  }

  // Distant procedural songbird chirps at randomized intervals
  private scheduleNextBirdChirp() {
    if (!this.isRunning) return;

    const delay = 4000 + Math.random() * 6000; // 4 to 10 seconds
    this.birdTimer = setTimeout(() => {
      this.playBirdSong();
      this.scheduleNextBirdChirp();
    }, delay);
  }

  private playBirdSong() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    const now = this.ctx.currentTime;
    const notesCount = 2 + Math.floor(Math.random() * 3); // 2-4 chirps in a song
    const baseFreq = 2400 + Math.random() * 800;

    for (let i = 0; i < notesCount; i++) {
      const chirpTime = now + i * (0.09 + Math.random() * 0.06);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch drop or rise characteristic of small warblers
      const startF = baseFreq + (Math.random() - 0.5) * 400;
      const endF = startF + (Math.random() > 0.5 ? -600 : 400);

      osc.frequency.setValueAtTime(startF, chirpTime);
      osc.frequency.exponentialRampToValueAtTime(endF, chirpTime + 0.07);

      gain.gain.setValueAtTime(0, chirpTime);
      gain.gain.linearRampToValueAtTime(0.04, chirpTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, chirpTime + 0.075);

      // Reverb simulation filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2800;
      filter.Q.value = 1.8;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(chirpTime);
      osc.stop(chirpTime + 0.08);
    }
  }

  // Interactive firefly burst chime on user click
  public playBurstChime() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    // Ancient forest pentatonic scale: F# minor pentatonic (mystical & serene)
    const pentatonic = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];

    // Pick 3-4 notes in quick ascending chime sequence
    const notes = [
      pentatonic[Math.floor(Math.random() * 2)],
      pentatonic[2 + Math.floor(Math.random() * 2)],
      pentatonic[4 + Math.floor(Math.random() * 2)],
    ];

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      // Soft lowpass filter to keep chime crystal-smooth
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 3500;

      osc.connect(f);
      f.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.9);
    });
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
      this.setupSanctuaryDrone();
      this.scheduleNextBirdChirp();
    }

    // Smoothly fade in volume over 1.2 seconds
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

  // Returns normalized energy (0 to 1) for the spirit creature heartbeat and vignette breathing
  public getEnergy(): number {
    if (!this.analyser || !this.dataArray || !this.isRunning) {
      // Natural organic breathing fallback if sound is muted
      const t = performance.now() * 0.0018;
      return 0.35 + Math.sin(t) * 0.15 + Math.sin(t * 2.3) * 0.08;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    // Sample bass and midrange bins
    const bins = Math.min(16, this.dataArray.length);
    for (let i = 0; i < bins; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / (bins * 255);
    // Smooth pulse
    return Math.max(0.2, Math.min(1.0, avg * 1.8 + 0.25));
  }
}

export const forestAudio = typeof window !== 'undefined' ? new ForestAudioEngine() : ({} as ForestAudioEngine);
