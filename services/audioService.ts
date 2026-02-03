/**
 * A simple service to generate synthesized sounds using the Web Audio API.
 * This ensures sounds work without needing external mp3 files.
 */
class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.5; // Default volume
    }
    // Resume context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public playTick() {
    this.init();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  public playPip() {
    this.init();
    if (!this.audioContext || !this.masterGain) return;

    const t = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    // A high pitched short pip
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.setValueAtTime(1200, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(t + 0.08);
  }

  public playSequence(count: number) {
    if (count <= 0) return;
    let played = 0;
    const interval = setInterval(() => {
        this.playPip();
        played++;
        if (played >= count) {
            clearInterval(interval);
        }
    }, 150);
  }

  public playWarning() {
    this.init();
    if (!this.audioContext || !this.masterGain) return;

    const t = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.setValueAtTime(800, t + 0.1);
    osc.frequency.setValueAtTime(600, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(t + 0.3);
  }

  public playAlarm() {
    this.init();
    if (!this.audioContext || !this.masterGain) return;

    const t = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    
    // Siren effect
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
    osc.frequency.linearRampToValueAtTime(800, t + 0.4);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.6);
    osc.frequency.linearRampToValueAtTime(800, t + 0.8);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 1.0);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(t + 1.0);
  }

  public stopAll() {
    if (this.audioContext) {
        this.audioContext.suspend();
        this.audioContext = null;
    }
  }
}

export const audioService = new AudioService();