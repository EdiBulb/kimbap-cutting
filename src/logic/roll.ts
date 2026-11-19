import { MIN_GAP_MM } from '../config';

/**
 * 칼질 한 번. 김밥 왼쪽 끝을 0으로 한 좌표(mm)에서
 * t = 윗면을 지나는 x, b = 아랫면을 지나는 x. t !== b 이면 비스듬히 썬 것.
 */
export interface Cut {
  t: number;
  b: number;
}

/** 두 경계(칼질 또는 김밥 끝) 사이의 김밥 한 알 */
export interface Piece {
  lt: number;
  lb: number;
  rt: number;
  rb: number;
  /** 왼쪽 면이 칼로 잘린 면인지 (false면 김밥 끝 = 꼬다리) */
  leftCut: boolean;
  rightCut: boolean;
}

export type CutResult =
  | { kind: 'ok'; index: number; thicknessMm: number | null }
  | { kind: 'outside' } // 김밥과 상관없는 곳
  | { kind: 'miss' } // 김밥 끝에 걸침
  | { kind: 'overlap' }; // 이미 썬 선과 겹치거나 교차

export const thicknessOf = (p: Piece): number => (p.rt - p.lt + (p.rb - p.lb)) / 2;

export class Roll {
  private list: Cut[] = [];

  constructor(readonly length: number) {}

  get cuts(): readonly Cut[] {
    return this.list;
  }

  get count(): number {
    return this.list.length + 1;
  }

  tryCut(t: number, b: number): CutResult {
    const L = this.length;
    const g = MIN_GAP_MM;
    if (Math.max(t, b) <= 0 || Math.min(t, b) >= L) return { kind: 'outside' };
    if (t <= g || b <= g || t >= L - g || b >= L - g) return { kind: 'miss' };

    for (const c of this.list) {
      const crosses = (t - c.t) * (b - c.b) <= 0;
      if (crosses || Math.abs(t - c.t) < g || Math.abs(b - c.b) < g) return { kind: 'overlap' };
    }

    const cut: Cut = { t, b };
    this.list.push(cut);
    this.list.sort((p, q) => p.t + p.b - (q.t + q.b));
    const index = this.list.indexOf(cut);
    if (index === 0) return { kind: 'ok', index, thicknessMm: null };

    const left = this.list[index - 1];
    return { kind: 'ok', index, thicknessMm: (t - left.t + (b - left.b)) / 2 };
  }

  pieces(): Piece[] {
    const bounds: Cut[] = [{ t: 0, b: 0 }, ...this.list, { t: this.length, b: this.length }];
    const out: Piece[] = [];
    for (let i = 0; i < bounds.length - 1; i++) {
      out.push({
        lt: bounds[i].t,
        lb: bounds[i].b,
        rt: bounds[i + 1].t,
        rb: bounds[i + 1].b,
        leftCut: i > 0,
        rightCut: i < bounds.length - 2,
      });
    }
    return out;
  }
}

/**
 * 스와이프를 김밥 중심선(cy)을 지나는 직선으로 바꿔요.
 * xc = 중심선과 만나는 x, k = 기울기 (y가 1 내려갈 때 x 변화량).
 */
export function swipeToLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cy: number,
  minSwipe: number,
  maxSlope: number,
): { xc: number; k: number } | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  if (dy < minSwipe) return null;
  const k = Math.max(-maxSlope, Math.min(maxSlope, dx / dy));
  const xc = x0 + (cy - y0) * (dx / dy);
  return { xc, k };
}

export interface Summary {
  count: number;
  avgMm: number;
  minMm: number;
  /** pieces 배열 기준, 가장 얇은 알의 인덱스 (꼬다리 제외) */
  thinnestIndex: number;
}

export function summarize(pieces: Piece[]): Summary {
  const from = pieces.length > 2 ? 1 : 0;
  const to = pieces.length > 2 ? pieces.length - 1 : pieces.length;
  let sum = 0;
  let minMm = Infinity;
  let thinnestIndex = from;
  for (let i = from; i < to; i++) {
    const th = thicknessOf(pieces[i]);
    sum += th;
    if (th < minMm) {
      minMm = th;
      thinnestIndex = i;
    }
  }
  return { count: pieces.length, avgMm: sum / (to - from), minMm, thinnestIndex };
}

export function gradeFor(count: number): string {
  if (count >= 45) return '김밥 장인 등극';
  if (count >= 30) return '분식집 에이스';
  if (count >= 18) return '엄마 손 김밥';
  if (count >= 8) return '소풍 김밥';
  return '통째로 드시는 걸로…';
}
