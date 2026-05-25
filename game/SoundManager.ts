const TITLE_BGM: [number, number][] = [
  [261.63, 0.6], [0, 0.2], [311.13, 0.4], [349.23, 0.4],
  [392.00, 0.8], [0, 0.2], [349.23, 0.4], [0, 0.4],
  [261.63, 0.4], [233.08, 0.4], [261.63, 0.8], [0, 0.8],
  [349.23, 0.6], [0, 0.2], [392.00, 0.4], [415.30, 0.4],
  [440.00, 0.8], [0, 0.2], [392.00, 0.4], [0, 0.4],
  [349.23, 0.4], [311.13, 0.4], [261.63, 1.2], [0, 0.8],
];

const GAME_BGM: [number, number][] = [
  [523.25, 0.12], [0, 0.06], [523.25, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06], [783.99, 0.24], [0, 0.12],
  [698.46, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06], [523.25, 0.12], [0, 0.06], [392.00, 0.24], [0, 0.12],
  [440.00, 0.12], [0, 0.06], [493.88, 0.12], [0, 0.06], [523.25, 0.12], [0, 0.06], [587.33, 0.24], [0, 0.12],
  [659.25, 0.12], [0, 0.06], [587.33, 0.12], [0, 0.06], [523.25, 0.12], [0, 0.06], [440.00, 0.24], [0, 0.24],
  [523.25, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06], [783.99, 0.12], [0, 0.06], [880.00, 0.24], [0, 0.12],
  [783.99, 0.12], [0, 0.06], [698.46, 0.12], [0, 0.06], [659.25, 0.12], [0, 0.06], [587.33, 0.24], [0, 0.24],
];

interface BgmData {
  interval: ReturnType<typeof setInterval> | null;
  nextTime: number;
}

export class SoundManager {
  private _ctx: AudioContext | null = null;
  private _muted = false;
  private _bgmData: BgmData | null = null;
  private _currentBgmType: string | null = null;

  private _getCtx(): AudioContext {
    if (!this._ctx) this._ctx = new AudioContext();
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  private _play(buildFn: (ctx: AudioContext) => void) {
    if (this._muted) return;
    try { buildFn(this._getCtx()); } catch { /* autoplay 制限時は無視 */ }
  }

  playShoot() {
    this._play(ctx => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    });
  }

  playExplosion() {
    this._play(ctx => {
      const bufSize = Math.floor(ctx.sampleRate * 0.25);
      const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data    = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src    = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain   = ctx.createGain();
      src.buffer       = buf;
      filter.type      = 'lowpass';
      filter.frequency.value = 900;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      src.start(ctx.currentTime);
    });
  }

  playBossExplosion() {
    this._play(ctx => {
      const bufSize = Math.floor(ctx.sampleRate * 0.9);
      const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data    = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src    = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain   = ctx.createGain();
      src.buffer       = buf;
      filter.type      = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.9);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.65, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      src.start(ctx.currentTime);
    });
  }

  playDamage() {
    this._play(ctx => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    });
  }

  playPowerup() {
    this._play(ctx => {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.09;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    });
  }

  playGameOver() {
    this._play(ctx => {
      [440, 349.23, 293.66, 220, 146.83].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.24;
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    });
  }

  startBgm(type: string) {
    this._currentBgmType = type;
    this.stopBgm();
    if (this._muted) return;

    const notes   = type === 'title' ? TITLE_BGM : GAME_BGM;
    const bgmGain = type === 'title' ? 0.07 : 0.05;
    const oscType = type === 'title' ? 'triangle' : 'square';
    let noteIndex = 0;

    const schedule = () => {
      if (!this._bgmData) return;
      try {
        const ctx = this._getCtx();
        while (this._bgmData.nextTime < ctx.currentTime + 0.5) {
          const [freq, dur] = notes[noteIndex % notes.length];
          if (freq > 0) {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = oscType as OscillatorType;
            osc.frequency.value = freq;
            const t = this._bgmData.nextTime;
            gain.gain.setValueAtTime(bgmGain, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.85);
            osc.start(t);
            osc.stop(t + dur);
          }
          this._bgmData.nextTime += dur;
          noteIndex++;
        }
      } catch { /* AudioContext が閉じられた場合は無視 */ }
    };

    try {
      const ctx = this._getCtx();
      this._bgmData = { interval: null, nextTime: ctx.currentTime + 0.05 };
      schedule();
      this._bgmData.interval = setInterval(schedule, 200);
    } catch { /* autoplay 制限時は無視 */ }
  }

  stopBgm() {
    if (this._bgmData) {
      if (this._bgmData.interval) clearInterval(this._bgmData.interval);
      this._bgmData = null;
    }
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this._muted) {
      this.stopBgm();
    } else if (this._currentBgmType) {
      this.startBgm(this._currentBgmType);
    }
    return this._muted;
  }

  get muted() { return this._muted; }
}
