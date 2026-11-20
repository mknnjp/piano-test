import { describe, it, expect } from 'vitest';
import { targetSemi, freqOf, semiName } from '../src/lib/pitch.js';
import { WHITE_SEMI } from '../src/lib/notes2.js';

describe('targetSemi', () => {
  it('調号なしは白鍵の半音数', () => {
    expect(targetSemi({ clef: 'treble', n: 0, key: 0, acc: 0 })).toBe(0);  // 低いド
    expect(targetSemi({ clef: 'treble', n: 7, key: 0, acc: 0 })).toBe(12); // 高いド
  });

  it('♯がつくと+1、♭がつくと-1', () => {
    expect(targetSemi({ clef: 'treble', n: 3, key: 1, acc: 1 })).toBe(WHITE_SEMI[3] + 1); // ファ♯
    expect(targetSemi({ clef: 'treble', n: 6, key: -1, acc: -1 })).toBe(WHITE_SEMI[6] - 1); // シ♭
  });
});

describe('freqOf', () => {
  it('ト音記号の低いド（semi=0）は約261.63Hz', () => {
    expect(freqOf('treble', 0)).toBeCloseTo(261.63, 1);
  });

  it('ヘ音記号は1オクターブ低い（octave=0.5）', () => {
    expect(freqOf('bass', 0)).toBeCloseTo(261.63 * 0.5, 1);
  });

  it('1オクターブ上（semi=12）は周波数2倍', () => {
    expect(freqOf('treble', 12)).toBeCloseTo(freqOf('treble', 0) * 2, 1);
  });
});

describe('semiName', () => {
  it('白鍵は音名を返す', () => {
    expect(semiName(0, 0)).toBe('低いド');
    expect(semiName(12, 0)).toBe('高いド');
  });

  it('黒鍵は調号に応じて♯/♭名を返す', () => {
    // semi=1: sharp=["ド","♯"], flat=["レ","♭"]
    expect(semiName(1, 1)).toBe('ド♯');
    expect(semiName(1, -1)).toBe('レ♭');
  });
});
