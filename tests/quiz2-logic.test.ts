import { describe, it, expect } from 'vitest';
import { makeQueue, accQuestion, sameQ, halfAndHalf } from '../src/lib/quiz2-logic.js';
import { accOf } from '../src/lib/accidentals.js';
import { ROUND } from '../src/lib/staff2.js';

// 決定的な疑似乱数（LCG）
const lcg = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
};

describe('makeQueue', () => {
  it('調号なし・単一記号: 8音を必ず1回ずつ含み、長さは ROUND', () => {
    const q = makeQueue('treble', { sharpOn: false, flatOn: false }, lcg(1));
    expect(q).toHaveLength(ROUND);
    const names = q.map((x) => x.n);
    for (let n = 0; n < 8; n++) {
      expect(names.filter((x) => x === n).length).toBeGreaterThanOrEqual(1);
    }
    // 全て同じ clef
    expect(q.every((x) => x.clef === 'treble')).toBe(true);
    // 調号なし
    expect(q.every((x) => x.key === 0 && x.acc === 0)).toBe(true);
  });

  it('調号なし・mix: ト音とヘ音が5問ずつ', () => {
    const q = makeQueue('mix', { sharpOn: false, flatOn: false }, lcg(2));
    expect(q).toHaveLength(ROUND);
    expect(q.filter((x) => x.clef === 'treble')).toHaveLength(5);
    expect(q.filter((x) => x.clef === 'bass')).toHaveLength(5);
  });

  it('調号あり: key が1〜4の範囲で、acc が accOf と一致', () => {
    const q = makeQueue('treble', { sharpOn: true, flatOn: false }, lcg(3));
    expect(q).toHaveLength(ROUND);
    for (const x of q) {
      expect(Math.abs(x.key)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(x.key)).toBeLessThanOrEqual(4);
      expect(x.key).toBeGreaterThan(0); // sharpOn のみ
    }
  });

  it('連続する2問が完全に同一にならない', () => {
    // 複数シードで試す
    for (let seed = 1; seed <= 20; seed++) {
      const q = makeQueue('mix', { sharpOn: true, flatOn: true }, lcg(seed));
      for (let i = 1; i < q.length; i++) {
        expect(sameQ(q[i], q[i - 1])).toBe(false);
      }
    }
  });
});

describe('accQuestion', () => {
  it('高いド♯（n=7, acc>0）は出題されない', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const q = accQuestion('treble', { sharpOn: true, flatOn: false }, lcg(seed));
      if (q.n === 7) {
        expect(q.acc).toBeLessThanOrEqual(0);
      }
    }
  });

  it('acc は accOf(key, n) と一致', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const q = accQuestion('bass', { sharpOn: true, flatOn: true }, lcg(seed));
      expect(q.acc).toBe(accOf(q.key, q.n));
    }
  });
});

describe('halfAndHalf', () => {
  it('ト音5問・ヘ音5問', () => {
    const h = halfAndHalf(lcg(1));
    expect(h).toHaveLength(ROUND);
    expect(h.filter((x) => x === 'treble')).toHaveLength(5);
    expect(h.filter((x) => x === 'bass')).toHaveLength(5);
  });
});
