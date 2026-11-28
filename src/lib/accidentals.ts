import { NOTES, SHARP_ORDER, FLAT_ORDER } from './notes2.js';

export type Accidental = -1 | 0 | 1;

// key: +n なら♯がn個、-n なら♭がn個、0 は調号なし
export const accOf = (key: number, n: number): Accidental => {
  const letter = NOTES[n].letter;
  if (key > 0) return SHARP_ORDER.slice(0, key).includes(letter) ? 1 : 0;
  if (key < 0) return FLAT_ORDER.slice(0, -key).includes(letter) ? -1 : 0;
  return 0;
};

export const symOf = (acc: number): string => {
  return acc > 0 ? '♯' : acc < 0 ? '♭' : '';
};
