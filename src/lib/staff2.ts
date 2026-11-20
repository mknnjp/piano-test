import { NOTES, CLEFS, type Clef } from './notes2.js';

export const SP = 20;          // 五線の間隔(px)
export const BOTTOM = 160;     // 第1線のy
export const U = SP / 250;     // フォント単位→px（1間 = 250単位）
export const GLYPH_MID = 134;  // 音符・♯・♭の「中心の高さ」（フォント単位）
export const ROUND = 10;       // 1セットの問題数
export const NOTE_X = 186;     // 出題の音符のx
export const STAFF_W = 320;    // 出題の譜面の幅

export interface Question {
  clef: Clef;
  n: number;
  key: number;
  acc: number;
}

export function posOf(q: Pick<Question, 'clef' | 'n'>): number {
  return NOTES[q.n].step + CLEFS[q.clef].shift;
}

export function yOf(pos: number): number {
  return BOTTOM - pos * SP / 2;
}
