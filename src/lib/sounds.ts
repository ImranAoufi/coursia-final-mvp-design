// Premium futuristic sound design for Coursia
// World-class UI sound effects inspired by Apple, Tesla, and Neuralink

class SoundEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.4; // Master volume control
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  private getMasterGain(): GainNode {
    this.getContext(); // Ensure context is initialized
    return this.masterGain!;
  }

  // Create a simple reverb effect for spatial depth
  private createReverb(ctx: AudioContext, duration: number = 0.5, decay: number = 2): ConvolverNode {
    const convolver = ctx.createConvolver();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / sampleRate;
      left[i] = (Math.random() * 2 - 1) * Math.exp(-n * decay);
      right[i] = (Math.random() * 2 - 1) * Math.exp(-n * decay);
    }

    convolver.buffer = impulse;
    return convolver;
  }

  // Premium button click - crisp, tactile with glass-like tone
  playButtonClick() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const master = this.getMasterGain();

    // Layer 1: High-frequency glass tap
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const panner1 = ctx.createStereoPanner();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2800, now);
    osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.04);
    
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    panner1.pan.value = 0.1;
    
    osc1.connect(gain1);
    gain1.connect(panner1);
    panner1.connect(master);
    
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Layer 2: Mid-range digital tap
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const panner2 = ctx.createStereoPanner();
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.03);
    
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    
    panner2.pan.value = -0.1;
    
    osc2.connect(gain2);
    gain2.connect(panner2);
    panner2.connect(master);
    
    osc2.start(now);
    osc2.stop(now + 0.06);

    // Layer 3: Subtle sub-bass for tactile feel
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(120, now);
    
    gain3.gain.setValueAtTime(0.08, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    osc3.connect(gain3);
    gain3.connect(master);
    
    osc3.start(now);
    osc3.stop(now + 0.04);
  }

  // Premium CTA confirmation - rewarding harmonic sweep with reverb
  playConfirmation() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const master = this.getMasterGain();

    // Create reverb for spatial depth
    const reverb = this.createReverb(ctx, 0.8, 3);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.3;
    reverb.connect(reverbGain);
    reverbGain.connect(master);

    // Harmonic sweep - ascending perfect fifth
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      const startTime = now + (index * 0.035);
      const duration = 0.25;
      
      // Smooth ADSR envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.015);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      // Subtle stereo spread
      panner.pan.value = (index - 1.5) * 0.15;
      
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(master);
      panner.connect(reverb);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // Add crystalline shimmer
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(3136, now + 0.08);
    
    shimmerGain.gain.setValueAtTime(0, now + 0.08);
    shimmerGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    shimmer.connect(shimmerGain);
    shimmerGain.connect(reverb);
    
    shimmer.start(now + 0.08);
    shimmer.stop(now + 0.28);
  }

  // Step forward - rewarding progression sound (similar to confirmation but lighter)
  playStepForward() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const master = this.getMasterGain();

    // Create reverb for spatial depth
    const reverb = this.createReverb(ctx, 0.6, 3.5);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.25;
    reverb.connect(reverbGain);
    reverbGain.connect(master);

    // Ascending triad - slightly different from confirmation
    const frequencies = [659.25, 830.61, 1046.5]; // E5, G#5, C6
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      const startTime = now + (index * 0.04);
      const duration = 0.22;
      
      // Instant, punchy ADSR envelope for immediate response
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      // Subtle stereo spread
      panner.pan.value = (index - 1) * 0.2;
      
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(master);
      panner.connect(reverb);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // Add crystalline shimmer (higher frequency than confirmation)
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(2637, now + 0.07);
    
    shimmerGain.gain.setValueAtTime(0.06, now + 0.06);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    
    shimmer.connect(shimmerGain);
    shimmerGain.connect(reverb);
    
    shimmer.start(now + 0.07);
    shimmer.stop(now + 0.25);
  }

  // Progress tick - subtle blip with upward pitch sweep
  playProgressSound() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const master = this.getMasterGain();

    // Main progress blip
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const panner1 = ctx.createStereoPanner();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
    
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    panner1.pan.value = 0.15;
    
    osc1.connect(gain1);
    gain1.connect(panner1);
    panner1.connect(master);
    
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Secondary harmonic for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const panner2 = ctx.createStereoPanner();
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1800, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
    
    gain2.gain.setValueAtTime(0.08, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    
    panner2.pan.value = -0.15;
    
    osc2.connect(gain2);
    gain2.connect(panner2);
    panner2.connect(master);
    
    osc2.start(now + 0.02);
    osc2.stop(now + 0.14);

    // Micro whoosh for motion feel
    const whoosh = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    const whooshFilter = ctx.createBiquadFilter();
    
    whoosh.type = 'sawtooth';
    whoosh.frequency.setValueAtTime(80, now);
    whoosh.frequency.exponentialRampToValueAtTime(400, now + 0.15);
    
    whooshFilter.type = 'lowpass';
    whooshFilter.frequency.setValueAtTime(800, now);
    whooshFilter.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
    
    whooshGain.gain.setValueAtTime(0.05, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    whoosh.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(master);
    
    whoosh.start(now);
    whoosh.stop(now + 0.15);
  }

  // Page transition whoosh - smooth gliding effect
  playTransition() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const master = this.getMasterGain();

    // Smooth whoosh with stereo movement
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const panner = ctx.createStereoPanner();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.25);
    filter.Q.value = 1;
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    // Stereo movement from left to right
    panner.pan.setValueAtTime(-0.3, now);
    panner.pan.linearRampToValueAtTime(0.3, now + 0.25);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(master);
    
    osc.start(now);
    osc.stop(now + 0.25);

    // High-frequency air layer
    const air = ctx.createOscillator();
    const airGain = ctx.createGain();
    const airFilter = ctx.createBiquadFilter();
    
    air.type = 'sine';
    air.frequency.setValueAtTime(2000, now);
    air.frequency.exponentialRampToValueAtTime(4000, now + 0.2);
    
    airFilter.type = 'highpass';
    airFilter.frequency.value = 1800;
    
    airGain.gain.setValueAtTime(0.04, now);
    airGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(master);
    
    air.start(now);
    air.stop(now + 0.2);
  }

  // Subtle hover sound - barely perceptible tactile feedback
  playHover() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const master = this.getMasterGain();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, now);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(master);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundEngine = new SoundEngine();
