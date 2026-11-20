import { describe, it, expect } from 'vitest';
import { accOf, symOf } from '../src/lib/accidentals.js';

describe('accOf', () => {
  it('key=0 は常に0', () => {
    expect(accOf(0, 0)).toBe(0);
    expect(accOf(0, 3)).toBe(0);
  });

  it('♯ key>0: SHARP_ORDER の最初の key 個に該当する字母なら1', () => {
    // key=1 → F のみ ♯
    expect(accOf(1, 3)).toBe(1);   // ファ (F)
    expect(accOf(1, 0)).toBe(0);   // ド (C)
    // key=2 → F, C
    expect(accOf(2, 0)).toBe(1);   // ド (C)
    expect(accOf(2, 3)).toBe(1);   // ファ (F)
    expect(accOf(2, 4)).toBe(0);   // ソ (G)
  });

  it('♭ key<0: FLAT_ORDER の最初の |key| 個に該当する字母なら-1', () => {
    // key=-1 → B のみ ♭
    expect(accOf(-1, 6)).toBe(-1);  // シ (B)
    expect(accOf(-1, 0)).toBe(0);   // ド (C)
    // key=-2 → B, E
    expect(accOf(-2, 2)).toBe(-1);  // ミ (E)
    expect(accOf(-2, 6)).toBe(-1);  // シ (B)
    expect(accOf(-2, 5)).toBe(0);   // ラ (A)
  });
});

describe('symOf', () => {
  it('正は♯、負は♭、0は空文字', () => {
    expect(symOf(1)).toBe('♯');
    expect(symOf(-1)).toBe('♭');
    expect(symOf(0)).toBe('');
  });
});
