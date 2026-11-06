import { BirdType, MaterialType } from '../types/game';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
    const savedMute = localStorage.getItem('angry_birds_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('angry_birds_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Slingshot stretch tension
  public playStretch(tension: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 80 + tension * 160;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 30, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio fallback silent
    }
  }

  // Slingshot release snap & bird fly
  public playLaunch(type: BirdType) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. Rubber band snap
    const oscSnap = this.ctx.createOscillator();
    const gainSnap = this.ctx.createGain();
    oscSnap.type = 'triangle';
    oscSnap.frequency.setValueAtTime(450, now);
    oscSnap.frequency.exponentialRampToValueAtTime(70, now + 0.12);
    gainSnap.gain.setValueAtTime(0.35, now);
    gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscSnap.connect(gainSnap);
    gainSnap.connect(this.masterGain);
    oscSnap.start(now);
    oscSnap.stop(now + 0.12);

    // 2. Bird battle squawk
    const oscBird = this.ctx.createOscillator();
    const gainBird = this.ctx.createGain();
    oscBird.type = 'sine';

    let startFreq = 420;
    let endFreq = 700;
    if (type === 'chuck') {
      startFreq = 550;
      endFreq = 950;
    } else if (type === 'bomb') {
      startFreq = 220;
      endFreq = 380;
    } else if (type === 'blues') {
      startFreq = 750;
      endFreq = 1200;
    } else if (type === 'terence') {
      startFreq = 140;
      endFreq = 220;
    }

    oscBird.frequency.setValueAtTime(startFreq, now + 0.02);
    oscBird.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);
    oscBird.frequency.exponentialRampToValueAtTime(startFreq + 100, now + 0.28);

    gainBird.gain.setValueAtTime(0.01, now);
    gainBird.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainBird.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    oscBird.connect(gainBird);
    gainBird.connect(this.masterGain);
    oscBird.start(now);
    oscBird.stop(now + 0.3);
  }

  // Bird special ability activation
  public playAbility(type: BirdType) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    if (type === 'chuck') {
      // Supersonic dash whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.22);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'blues') {
      // Trio split chirp
      [0, 0.05, 0.1].forEach((delay, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + i * 200, now + delay);
        osc.frequency.exponentialRampToValueAtTime(1200 + i * 250, now + delay + 0.1);
        gain.gain.setValueAtTime(0.18, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } else if (type === 'matilda') {
      // Egg drop "bawk!"
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  // Material impacts
  public playHit(material: MaterialType, intensity: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const clampedIntensity = Math.min(Math.max(intensity, 0.2), 2);
    const now = this.ctx.currentTime;

    if (material === 'wood') {
      // Wood crack / knock
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.09);
      gain.gain.setValueAtTime(0.25 * clampedIntensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (material === 'ice') {
      // Ice / glass crystal shatter
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
      gain.gain.setValueAtTime(0.2 * clampedIntensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (material === 'stone') {
      // Stone thud / crunch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
      gain.gain.setValueAtTime(0.3 * clampedIntensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // Explosion (TNT or Bomb bird)
  public playExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Deep sub-bass thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);

    // Noise rumble
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
    } catch {
      // Fallback
    }
  }

  // Pig squeak on hit
  public playPigHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(620, now + 0.08);
    osc.frequency.linearRampToValueAtTime(380, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Pig destroyed poof
  public playPigPoof() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Pop squeak
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.18);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Level Complete Fanfare
  public playWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.0, d: 0.12 }, // C5
      { f: 659.25, t: 0.14, d: 0.12 }, // E5
      { f: 783.99, t: 0.28, d: 0.15 }, // G5
      { f: 1046.50, t: 0.44, d: 0.35 }, // C6
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.25, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }

  // Star pop jingle
  public playStar(starIndex: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [587.33, 739.99, 880.0]; // D5, F#5, A5
    const freq = baseFreqs[starIndex] || 880;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Level Failed
  public playFail() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.25);
    osc.frequency.linearRampToValueAtTime(180, now + 0.55);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Click UI
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundManager = new SoundManager();
