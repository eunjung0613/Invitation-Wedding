/**
 * 저작권 걱정 없는 3/4박자 어쿠스틱 스트링 & 피아노 왈츠 신시사이저
 * - 사용자가 public/audio/sunlit-string-waltz.mp3 를 넣으면 실제 MP3를 재생하고,
 *   MP3 파일이 없을 때 자동으로 이 햇살 왈츠 멜로디가 부드럽게 연주됩니다.
 */
export class SunlitWaltzSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private playing = false;

  // F major / D minor 따뜻한 봄날 3/4 왈츠 코드 진행 (8마디 = 24박)
  private readonly measures: Array<{
    bass: number;
    chord: number[];
    melody: Array<number | null>;
  }> = [
    { bass: 174.61, chord: [261.63, 329.63, 349.23], melody: [523.25, null, 659.25] }, // Fmaj7
    { bass: 174.61, chord: [261.63, 329.63, 440.0], melody: [698.46, 659.25, 587.33] }, // Fmaj7
    { bass: 146.83, chord: [220.0, 261.63, 349.23], melody: [523.25, null, 440.0] }, // Dm7
    { bass: 146.83, chord: [220.0, 293.66, 349.23], melody: [587.33, 523.25, 440.0] }, // Dm7
    { bass: 233.08, chord: [293.66, 349.23, 440.0], melody: [466.16, null, 587.33] }, // Bbmaj7
    { bass: 196.0, chord: [293.66, 349.23, 466.16], melody: [659.25, 587.33, 523.25] }, // Gm7
    { bass: 130.81, chord: [261.63, 329.63, 392.0], melody: [587.33, null, 523.25] }, // C7sus / C
    { bass: 130.81, chord: [233.08, 329.63, 392.0], melody: [440.0, 466.16, 523.25] }, // C7
  ];

  private playTone(
    freq: number,
    duration: number,
    volume: number,
    type: OscillatorType,
    attack = 0.04
  ) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "sawtooth" ? 1100 : 1800, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  private tick() {
    if (!this.playing) return;
    const measureIdx = Math.floor(this.step / 3) % this.measures.length;
    const beat = this.step % 3; // 0 = 쿵, 1 = 짝, 2 = 짝
    const m = this.measures[measureIdx];

    if (beat === 0) {
      // 따뜻한 첼로/베이스 1박
      this.playTone(m.bass, 1.45, 0.12, "triangle", 0.08);
      // 부드러운 스트링 패드
      m.chord.forEach((f) => this.playTone(f, 1.5, 0.028, "sine", 0.25));
    } else {
      // 왈츠 2, 3박 가벼운 아르페지오 코드
      m.chord.forEach((f, idx) =>
        this.playTone(f * (idx === 2 ? 1 : 1), 0.55, 0.032, "triangle", 0.02)
      );
    }

    const melodyNote = m.melody[beat];
    if (melodyNote) {
      // 맑은 바이올린/피아노 멜로디
      this.playTone(melodyNote, 1.05, 0.075, "sine", 0.06);
      this.playTone(melodyNote * 2, 0.7, 0.015, "triangle", 0.04);
    }

    this.step += 1;
  }

  start(): void {
    if (this.playing) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    this.playing = true;
    this.tick();
    // 1박 약 580ms (느긋한 103 BPM 왈츠 템포)
    this.timer = window.setInterval(() => this.tick(), 580);
  }

  stop(): void {
    this.playing = false;
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}
