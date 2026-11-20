import { NOTES, WHITE_SEMI, BLACK_KEYS, CLEFS, type Clef } from './notes2.js';
import { symOf } from './accidentals.js';
import type { Question } from './staff2.js';

export function targetSemi(q: Question): number {
  return WHITE_SEMI[q.n] + q.acc;
}

export function freqOf(clef: Clef, semi: number): number {
  return 261.63 * Math.pow(2, semi / 12) * CLEFS[clef].octave;
}

export function fullName(i: number): string {
  return NOTES[i].long || NOTES[i].name;
}

export function shortName(i: number): string {
  return NOTES[i].short || NOTES[i].name;
}

// 問題の音の名前（♯・♭がつくときは「ファ♯」のように）
export function qName(q: Question): string {
  return q.acc ? NOTES[q.n].name + symOf(q.acc) : fullName(q.n);
}

export function qLabel(q: Question): string {
  return q.acc ? NOTES[q.n].name + symOf(q.acc) : shortName(q.n);
}

// 押した鍵盤の名前（黒鍵は、調号が♭なら♭の名前で呼ぶ）
export function semiName(semi: number, key: number): string {
  const w = WHITE_SEMI.indexOf(semi);
  if (w >= 0) return shortName(w);
  const b = BLACK_KEYS.find((k) => k.semi === semi);
  if (!b) return '';
  return (key < 0 ? b.flat : b.sharp).join('');
}

export function fmtSec(ms: number): string {
  return (ms / 1000).toFixed(1) + '秒';
}
