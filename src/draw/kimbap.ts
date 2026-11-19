import * as Phaser from 'phaser';
import { COLOR } from '../config';
import type { Piece } from '../logic/roll';

export interface Sesame {
  x: number; // 김밥 좌표 (mm)
  y: number; // 0(윗면) ~ 1(아랫면)
}

/** 김밥 한 줄에 박힌 참깨. 시드 고정이라 매판 같은 모양이에요. */
export function makeSesame(lengthMm: number, n = 160): Sesame[] {
  let seed = 12345;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, () => ({ x: rnd() * lengthMm, y: 0.08 + rnd() * 0.84 }));
}

// 김 색: 위가 밝고 아래가 어두운 원통 음영
const STOPS: [number, number][] = [
  [0, 0x46583a],
  [0.18, 0x2a3822],
  [0.65, 0x151d10],
  [1, 0x0b1008],
];
const BANDS = 14;
const FILLINGS = [0xf2c230, 0xe8762b, 0x4f8a2b, 0xe88a9a]; // 단무지, 당근, 시금치, 햄

function lerpColor(a: number, b: number, f: number): number {
  const ch = (c: number, s: number) => (c >> s) & 0xff;
  const mix = (s: number) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * f);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}
function seaweedAt(f: number): number {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [f0, c0] = STOPS[i];
    const [f1, c1] = STOPS[i + 1];
    if (f <= f1) return lerpColor(c0, c1, (f - f0) / (f1 - f0));
  }
  return STOPS[STOPS.length - 1][1];
}
const BAND_COLORS = Array.from({ length: BANDS }, (_, i) => seaweedAt((i + 0.5) / BANDS));

const v = (x: number, y: number) => new Phaser.Math.Vector2(x, y);

export interface DrawOpts {
  sesame?: Sesame[];
  /** 조각을 옮겨 그릴 때 참깨 좌표를 맞추기 위한 이동량 (mm) */
  sesameShiftMm?: number;
  highlight?: boolean;
}

/**
 * 옆에서 본 김밥 한 알. x0/top은 화면 좌표, s는 px/mm.
 * 잘린 면에는 밥(흰 선)과 속재료 색을 그려요.
 */
export function drawPiece(
  g: Phaser.GameObjects.Graphics,
  p: Piece,
  x0: number,
  top: number,
  s: number,
  diaMm: number,
  opts: DrawOpts = {},
): void {
  const h = diaMm * s;
  let { lt, lb, rt, rb } = p;

  // 조각 사이 틈 (너무 얇은 조각은 틈도 작게)
  const ins = Math.max(0, Math.min(0.4, Math.min(rt - lt, rb - lb) * 0.25));
  if (p.leftCut) {
    lt += ins;
    lb += ins;
  }
  if (p.rightCut) {
    rt -= ins;
    rb -= ins;
  }

  const xl = (f: number) => x0 + (lt + (lb - lt) * f) * s;
  const xr = (f: number) => x0 + (rt + (rb - rt) * f) * s;
  const band = (f0: number, f1: number) => [
    v(xl(f0), top + f0 * h),
    v(xr(f0), top + f0 * h),
    v(xr(f1), top + f1 * h),
    v(xl(f1), top + f1 * h),
  ];

  // 김
  for (let i = 0; i < BANDS; i++) {
    g.fillStyle(BAND_COLORS[i], 1);
    g.fillPoints(band(i / BANDS, Math.min(1, (i + 1.15) / BANDS)), true);
  }
  // 윤기
  g.fillStyle(0xffffff, 0.13);
  g.fillPoints(band(0.12, 0.17), true);

  // 참깨
  if (opts.sesame) {
    const shift = opts.sesameShiftMm ?? 0;
    g.fillStyle(COLOR.sesame, 1);
    for (const sd of opts.sesame) {
      const x = sd.x - shift;
      const left = lt + (lb - lt) * sd.y;
      const right = rt + (rb - rt) * sd.y;
      if (x - 0.6 < left || x + 0.6 > right) continue;
      g.fillEllipse(x0 + x * s, top + sd.y * h, 1.2 * s, 0.6 * s, 8);
    }
  }

  // 잘린 면
  const face = (xt: number, xb: number) => {
    const ax = x0 + xt * s;
    const bx = x0 + xb * s;
    const at = (f: number) => [ax + (bx - ax) * f, top + h * f] as const;
    g.lineStyle(Math.max(2.5, 0.9 * s), COLOR.rice, 1);
    g.lineBetween(...at(0.06), ...at(0.94));
    FILLINGS.forEach((c, i) => {
      g.lineStyle(Math.max(1.5, 0.55 * s), c, 1);
      g.lineBetween(...at(0.3 + i * 0.1), ...at(0.4 + i * 0.1));
    });
  };
  if (p.leftCut) face(lt, lb);
  if (p.rightCut) face(rt, rb);

  if (opts.highlight) {
    g.lineStyle(5, COLOR.gold, 1);
    g.strokePoints(band(0, 1), true, true);
  }
}
