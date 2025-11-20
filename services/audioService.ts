
// Simple synthesized audio service to avoid external assets
export const playVictorySound = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
  
    const ctx = new AudioContext();
    
    const playNote = (freq: number, time: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };
  
    const now = ctx.currentTime;
    
    // Fanfare melody
    playNote(523.25, now, 0.1);       // C5
    playNote(523.25, now + 0.1, 0.1); // C5
    playNote(523.25, now + 0.2, 0.1); // C5
    playNote(659.25, now + 0.3, 0.4); // E5
    playNote(587.33, now + 0.7, 0.1); // D5
    playNote(659.25, now + 0.8, 0.1); // E5
    playNote(783.99, now + 0.9, 0.6); // G5
  };
  
  export const playSplashSound = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      // Slide pitch down for splash effect
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
  };
