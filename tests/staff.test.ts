import { describe, it, expect } from 'vitest';
import { positionToY, stepToY, type StaffLayout } from '../src/lib/staff.js';

const LAYOUT: StaffLayout = { lineSpacing: 16, staffTop: 50, staffLeft: 50, staffWidth: 260 };

describe('positionToY', () => {
  it('position 0（最上線の上）は staffTop + 4 * lineSpacing を返す', () => {
    expect(positionToY(0, LAYOUT)).toBe(50 + 4 * 16);
  });

  it('position 8（最下線の下）は staffTop を返す', () => {
    expect(positionToY(8, LAYOUT)).toBe(50);
  });

  it('position 4（中央の線）は staffTop + 2 * lineSpacing を返す', () => {
    expect(positionToY(4, LAYOUT)).toBe(50 + 2 * 16);
  });

  it('position が 2 増えると lineSpacing 分だけ上に移動する', () => {
    expect(positionToY(2, LAYOUT) - positionToY(4, LAYOUT)).toBe(16);
  });
});

describe('stepToY', () => {
  const NOTE_MAP_LAYOUT: StaffLayout = { lineSpacing: 18, staffTop: 40, staffLeft: 40, staffWidth: 200 };

  it('step 0 は staffTop を返す', () => {
    expect(stepToY(0, NOTE_MAP_LAYOUT)).toBe(40);
  });

  it('step 8 は staffTop + 4 * lineSpacing を返す', () => {
    expect(stepToY(8, NOTE_MAP_LAYOUT)).toBe(40 + 4 * 18);
  });

  it('step が 2 増えると lineSpacing 分だけ下に移動する', () => {
    expect(stepToY(2, NOTE_MAP_LAYOUT) - stepToY(0, NOTE_MAP_LAYOUT)).toBe(18);
  });
});
