import type { Piece } from './roll';

export interface PlateItem {
  /** 왼쪽 끝을 0으로 옮긴 조각 */
  piece: Piece;
  /** 원래 김밥 좌표에서 옮긴 거리 (참깨 위치 맞출 때 사용) */
  shiftMm: number;
  widthMm: number;
  x: number;
  top: number;
}

export interface PlateLayout {
  scale: number; // px/mm
  items: PlateItem[];
}

/**
 * 조각들을 접시 안 정사각형 영역에 줄 맞춰 세워 놓는 배치.
 * 다 들어가는 가장 큰 배율을 이진 탐색으로 찾아요.
 */
export function layoutPlate(
  pieces: Piece[],
  box: { cx: number; cy: number; size: number },
  diaMm: number,
  gapMm = 4,
  rowGapMm = 8,
): PlateLayout {
  const norm = pieces.map((p) => {
    const m = Math.min(p.lt, p.lb);
    return {
      piece: { ...p, lt: p.lt - m, lb: p.lb - m, rt: p.rt - m, rb: p.rb - m },
      shiftMm: m,
      widthMm: Math.max(p.rt, p.rb) - m,
    };
  });

  const rowsFor = (s: number) => {
    const maxW = box.size / s;
    const rows: (typeof norm)[] = [[]];
    let rw = 0;
    for (const n of norm) {
      if (rw > 0 && rw + n.widthMm > maxW) {
        rows.push([]);
        rw = 0;
      }
      rows[rows.length - 1].push(n);
      rw += n.widthMm + gapMm;
    }
    return rows;
  };

  const fits = (s: number) => {
    if (norm.some((n) => n.widthMm * s > box.size)) return false;
    const rows = rowsFor(s);
    return rows.length * diaMm + (rows.length - 1) * rowGapMm <= box.size / s;
  };

  let lo = 0.1;
  let hi = 20;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }

  const s = lo;
  const rows = rowsFor(s);
  const totalH = (rows.length * diaMm + (rows.length - 1) * rowGapMm) * s;
  const items: PlateItem[] = [];
  rows.forEach((row, ri) => {
    const rw = row.reduce((a, n) => a + n.widthMm, 0) + gapMm * (row.length - 1);
    let x = box.cx - (rw * s) / 2;
    const top = box.cy - totalH / 2 + ri * (diaMm + rowGapMm) * s;
    for (const n of row) {
      items.push({ ...n, x, top });
      x += (n.widthMm + gapMm) * s;
    }
  });
  return { scale: s, items };
}
