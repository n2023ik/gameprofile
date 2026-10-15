let context: AudioContext | null = null;
let muted = false;
export function unlockAudio() {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
}
export function muteAudio(value: boolean) { muted = value; }
export function sound(kind: 'jump' | 'double' | 'coin' | 'break' | 'land' | 'checkpoint') {
  if (!context || muted) return;
  const ctx = context; const t = ctx.currentTime;
  const frequencies = kind === 'coin' ? [880, 1320] : kind === 'checkpoint' ? [523, 659, 784] : [kind === 'break' ? 100 : kind === 'land' ? 70 : kind === 'double' ? 520 : 280];
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator(); const gain = ctx.createGain(); const start = t + i * .055;
    osc.type = kind === 'break' ? 'sawtooth' : 'sine'; osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(kind === 'break' || kind === 'land' ? 30 : freq * 1.5, start + .14);
    gain.gain.setValueAtTime(.07, start); gain.gain.exponentialRampToValueAtTime(.001, start + .2);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + .22);
  });
}