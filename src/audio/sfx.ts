// 효과음 파일 없이 Web Audio로 바로 만드는 소리.
// 브라우저 정책상 첫 터치 때 unlock()을 불러야 소리가 나요.

let ac: AudioContext | null = null;

export function unlock(): void {
  if (!ac) {
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ac = new Ctor();
    } catch {
      return;
    }
  }
  if (ac.state === 'suspended') void ac.resume();
}

function noiseBuffer(ctx: AudioContext, sec: number): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * sec), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  return buf;
}

/** 도마에 칼 닿는 "탁" */
export function chop(): void {
  if (!ac) return;
  const t = ac.currentTime;

  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 0.08);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1800;
  bp.Q.value = 0.8;
  const ng = ac.createGain();
  ng.gain.value = 0.5;
  src.connect(bp).connect(ng).connect(ac.destination);
  src.start(t);

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
  const og = ac.createGain();
  og.gain.setValueAtTime(0.45, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(og).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.11);
}

/** 아주 얇게 썰었을 때 "띵" */
export function ding(): void {
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1320, t);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.26);
}

export function vibrate(ms: number): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* 지원 안 하는 기기 */
  }
}
