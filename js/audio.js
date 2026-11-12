/** Sons procéduraux. Déblocage au premier geste. */

let ctx = null;
let unlocked = false;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(v) {
  muted = Boolean(v);
  return muted;
}

export function isUnlocked() {
  return unlocked;
}

export function unlockAudio() {
  if (unlocked && ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  const resume = () => {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };
  resume();
  unlocked = true;
}

function beep(freq, dur, type, gain, at) {
  if (muted || !ctx || ctx.state === 'suspended') return;
  const t0 = ctx.currentTime + (at || 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || 'square';
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.06, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function play(name) {
  if (muted || !unlocked || !ctx) return;
  switch (name) {
    case 'tap':
      beep(420, 0.06, 'square', 0.04);
      break;
    case 'bid':
      beep(360, 0.1, 'triangle', 0.05);
      beep(540, 0.08, 'triangle', 0.04, 0.07);
      break;
    case 'pull':
      beep(280, 0.12, 'sawtooth', 0.045);
      beep(340, 0.1, 'sawtooth', 0.03, 0.08);
      break;
    case 'lock':
      beep(180, 0.2, 'square', 0.06);
      beep(120, 0.25, 'square', 0.05, 0.1);
      break;
    case 'lien':
      beep(520, 0.12, 'triangle', 0.06);
      beep(660, 0.14, 'triangle', 0.05, 0.1);
      beep(784, 0.18, 'triangle', 0.04, 0.2);
      break;
    case 'redact':
      beep(140, 0.22, 'square', 0.06);
      beep(90, 0.2, 'sawtooth', 0.04, 0.08);
      break;
    case 'secret':
      beep(200, 0.16, 'triangle', 0.05);
      beep(160, 0.2, 'triangle', 0.04, 0.12);
      break;
    case 'win':
      [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.22, 'triangle', 0.06, i * 0.12));
      break;
    case 'lose':
      [330, 262, 196].forEach((f, i) => beep(f, 0.28, 'sawtooth', 0.05, i * 0.16));
      break;
    case 'ai':
      beep(190, 0.09, 'square', 0.035);
      break;
    default:
      beep(400, 0.07, 'square', 0.035);
  }
}
