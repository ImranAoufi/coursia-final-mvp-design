// Modern tech sound effects using Web Audio API

class SoundEngine {
  private context: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  // Modern button click sound - short, punchy
  playButtonClick() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Create oscillator for the click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Quick frequency sweep for modern feel
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    
    // Sharp attack, quick decay
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.type = 'sine';
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Progress/success sound - dopamine-inducing, rewarding
  playProgressSound() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Create a pleasant chord progression
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now);
      osc.type = 'sine';
      
      // Stagger the notes slightly for a richer sound
      const startTime = now + (index * 0.02);
      const duration = 0.3;
      
      // Smooth envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // Add a subtle high frequency "sparkle"
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    
    sparkle.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    
    sparkle.frequency.setValueAtTime(2093, now + 0.05); // High C
    sparkle.type = 'sine';
    
    sparkleGain.gain.setValueAtTime(0, now + 0.05);
    sparkleGain.gain.linearRampToValueAtTime(0.1, now + 0.07);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    sparkle.start(now + 0.05);
    sparkle.stop(now + 0.25);
  }
}

export const soundEngine = new SoundEngine();
