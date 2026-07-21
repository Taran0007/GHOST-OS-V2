/**
 * SoundPlayer - Web Audio API Synthesizer & Audio URL Player
 * Generates crisp open-source sound effects and plays CDN audio files.
 */

export class SoundPlayerService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playSound(name: string, customUrl?: string, volume: number = 90) {
    const vol = Math.max(0, Math.min(100, volume)) / 100;

    // 1. If custom audio URL is provided, attempt HTML5 Audio play
    if (customUrl && (customUrl.startsWith('http') || customUrl.startsWith('data:'))) {
      try {
        const audio = new Audio(customUrl);
        audio.volume = vol;
        audio.play().catch((err) => {
          console.warn(`[SoundPlayer] Custom audio play error for ${name}:`, err);
          this.playSynthSound(name, vol);
        });
        return;
      } catch {
        // Fallback to synth sound
      }
    }

    // 2. Play Web Audio API synthesized sound effects
    this.playSynthSound(name, vol);
  }

  public playSynthSound(name: string, vol: number) {
    try {
      const ctx = this.getAudioContext();
      const lower = name.toLowerCase();

      if (lower.includes('horn') || lower.includes('air horn')) {
        this.playAirHorn(ctx, vol);
      } else if (lower.includes('fanfare') || lower.includes('victory')) {
        this.playVictoryFanfare(ctx, vol);
      } else if (lower.includes('bruh')) {
        this.playBruhSound(ctx, vol);
      } else if (lower.includes('fail') || lower.includes('violin') || lower.includes('trombone')) {
        this.playFailTrombone(ctx, vol);
      } else if (lower.includes('siren') || lower.includes('police')) {
        this.playSiren(ctx, vol);
      } else if (lower.includes('cash') || lower.includes('register') || lower.includes('coin')) {
        this.playCashRegister(ctx, vol);
      } else if (lower.includes('level') || lower.includes('up')) {
        this.playLevelUp(ctx, vol);
      } else if (lower.includes('laugh')) {
        this.playLaugh(ctx, vol);
      } else if (lower.includes('boom') || lower.includes('vine')) {
        this.playVineBoom(ctx, vol);
      } else if (lower.includes('quack') || lower.includes('duck')) {
        this.playQuack(ctx, vol);
      } else if (lower.includes('rimshot')) {
        this.playRimshot(ctx, vol);
      } else {
        // Default chime
        this.playBeepChime(ctx, vol);
      }
    } catch (e) {
      console.warn('[SoundPlayer] Web Audio API failed:', e);
    }
  }

  private playAirHorn(ctx: AudioContext, vol: number) {
    const freqs = [370, 466, 554, 622]; // Typical air horn harmonic cluster
    const now = ctx.currentTime;
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(vol * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  private playVictoryFanfare(ctx: AudioContext, vol: number) {
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },  // C5
      { f: 659.25, t: 0.15, d: 0.15 },// E5
      { f: 783.99, t: 0.3, d: 0.15 }, // G5
      { f: 1046.5, t: 0.45, d: 0.5 }, // C6
    ];
    const now = ctx.currentTime;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(vol * 0.3, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  private playBruhSound(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

    gain.gain.setValueAtTime(vol * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  private playVineBoom(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    gain.gain.setValueAtTime(vol * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  private playFailTrombone(ctx: AudioContext, vol: number) {
    const notes = [
      { f: 233.08, t: 0, d: 0.3 },   // Bb3
      { f: 220.0,  t: 0.3, d: 0.3 },  // A3
      { f: 207.65, t: 0.6, d: 0.3 },  // Ab3
      { f: 196.0,  t: 0.9, d: 0.8 },  // G3 (wah)
    ];
    const now = ctx.currentTime;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      if (n.t === 0.9) {
        osc.frequency.linearRampToValueAtTime(175, now + n.t + n.d);
      }

      gain.gain.setValueAtTime(vol * 0.25, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  private playSiren(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
    osc.frequency.linearRampToValueAtTime(600, now + 0.6);

    gain.gain.setValueAtTime(vol * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  private playCashRegister(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(vol * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  private playLevelUp(ctx: AudioContext, vol: number) {
    const freqs = [440, 554.37, 659.25, 880];
    const now = ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + i * 0.08);

      gain.gain.setValueAtTime(vol * 0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.15);
    });
  }

  private playLaugh(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + (i % 2) * 80, now + i * 0.12);

      gain.gain.setValueAtTime(vol * 0.2, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.1);
    }
  }

  private playQuack(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(vol * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private playRimshot(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    // Rimshot: two fast hits + cymbal
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(250, now);
    gain1.gain.setValueAtTime(vol * 0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(200, now + 0.12);
    gain2.gain.setValueAtTime(vol * 0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.2);
  }

  private playBeepChime(ctx: AudioContext, vol: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(vol * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const SoundPlayer = new SoundPlayerService();
