import { describe, it, expect } from 'vitest';
import { pointsFor } from '../src/lib/scoring.js';

describe('pointsFor', () => {
  it('不正解は0点', () => {
    expect(pointsFor(false, 0)).toBe(0);
    expect(pointsFor(false, 10)).toBe(0);
  });

  it('1.5秒までは満点（100点）', () => {
    expect(pointsFor(true, 0)).toBe(100);
    expect(pointsFor(true, 1.5)).toBe(100);
  });

  it('1.5秒を超えると1秒ごとに10点減る', () => {
    expect(pointsFor(true, 2.5)).toBe(90);
    expect(pointsFor(true, 3.5)).toBe(80);
  });

  it('最低40点で頭打ち', () => {
    expect(pointsFor(true, 10)).toBe(40);
    expect(pointsFor(true, 100)).toBe(40);
  });
});
