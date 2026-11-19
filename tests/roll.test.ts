import { describe, expect, it } from 'vitest';
import { Roll, summarize, swipeToLine, thicknessOf } from '../src/logic/roll';
import { layoutPlate } from '../src/logic/plate';

describe('Roll', () => {
  it('starts as one whole piece', () => {
    const r = new Roll(200);
    expect(r.count).toBe(1);
    expect(r.pieces()[0]).toMatchObject({ lt: 0, rt: 200, leftCut: false, rightCut: false });
  });

  it('reports the thickness of the new slice on the left', () => {
    const r = new Roll(200);
    expect(r.tryCut(10, 10)).toEqual({ kind: 'ok', index: 0, thicknessMm: null }); // 꼬다리
    const res = r.tryCut(15, 17);
    expect(res.kind).toBe('ok');
    if (res.kind === 'ok') expect(res.thicknessMm).toBeCloseTo(6);
    expect(r.count).toBe(3);
  });

  it('keeps cuts sorted even when cut out of order', () => {
    const r = new Roll(200);
    r.tryCut(100, 100);
    r.tryCut(50, 50);
    expect(r.cuts.map((c) => c.t)).toEqual([50, 100]);
  });

  it('rejects cuts that cross or touch an existing cut', () => {
    const r = new Roll(200);
    r.tryCut(50, 50);
    expect(r.tryCut(48, 52).kind).toBe('overlap'); // 교차
    expect(r.tryCut(50.1, 55).kind).toBe('overlap'); // 너무 가까움
    expect(r.tryCut(52, 58).kind).toBe('ok');
  });

  it('distinguishes outside and edge misses', () => {
    const r = new Roll(200);
    expect(r.tryCut(-20, -10).kind).toBe('outside');
    expect(r.tryCut(-5, 5).kind).toBe('miss');
    expect(r.tryCut(198, 203).kind).toBe('miss');
  });
});

describe('swipeToLine', () => {
  it('ignores short or upward swipes', () => {
    expect(swipeToLine(0, 100, 0, 120, 500, 60, 1.2)).toBeNull();
    expect(swipeToLine(0, 300, 0, 100, 500, 60, 1.2)).toBeNull();
  });

  it('extends a 45° swipe to the roll centre line', () => {
    const l = swipeToLine(100, 100, 200, 200, 300, 60, 1.2)!;
    expect(l.k).toBeCloseTo(1);
    expect(l.xc).toBeCloseTo(300);
  });

  it('clamps steep angles', () => {
    expect(swipeToLine(0, 0, 500, 100, 50, 60, 1.2)!.k).toBe(1.2);
  });
});

describe('summarize', () => {
  it('excludes the two end pieces from avg/min', () => {
    const r = new Roll(100);
    [10, 12, 20].forEach((x) => r.tryCut(x, x));
    const s = summarize(r.pieces());
    expect(s.count).toBe(4);
    expect(s.minMm).toBeCloseTo(2);
    expect(s.avgMm).toBeCloseTo(5);
    expect(thicknessOf(r.pieces()[s.thinnestIndex])).toBeCloseTo(2);
  });
});

describe('layoutPlate', () => {
  it('fits every piece inside the box', () => {
    const r = new Roll(200);
    for (let x = 5; x < 200; x += 4) r.tryCut(x, x + 1);
    const box = { cx: 300, cy: 300, size: 400 };
    const { items, scale } = layoutPlate(r.pieces(), box, 36);
    expect(items).toHaveLength(r.count);
    for (const it of items) {
      expect(it.x).toBeGreaterThanOrEqual(box.cx - box.size / 2 - 1e-6);
      expect(it.x + it.widthMm * scale).toBeLessThanOrEqual(box.cx + box.size / 2 + 1e-6);
      expect(it.top).toBeGreaterThanOrEqual(box.cy - box.size / 2 - 1e-6);
    }
  });
});
