import { ROUND } from './staff2.js';
import { MAX_KEY } from './notes2.js';
import { accOf } from './accidentals.js';
import type { Question } from './staff2.js';
import type { Mode } from './notes2.js';

export type Rng = () => number;

export function rand(n: number, rng: Rng = Math.random): number {
  return Math.floor(rng() * n);
}

export function pick<T>(a: T[], rng: Rng = Math.random): T {
  return a[rand(a.length, rng)];
}

export function shuffle<T>(a: T[], rng: Rng = Math.random): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1, rng);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function halfAndHalf(rng: Rng = Math.random): ('treble' | 'bass')[] {
  return shuffle(
    Array.from({ length: ROUND }, (_, i) => (i < ROUND / 2 ? 'treble' : 'bass')),
    rng
  );
}

export function sameQ(a: Question, b: Question): boolean {
  return a.clef === b.clef && a.n === b.n && a.key === b.key;
}

export interface AccOptions {
  sharpOn: boolean;
  flatOn: boolean;
}

// 調号ありの1問：オンになっている♯・♭から1つ選び（両方オンならどちらか）、数は1〜4個。
// 6割は調号がつく音、4割はつかない音を出す（「この音にはつかない」も見分ける練習）
export function accQuestion(clef: 'treble' | 'bass', opts: AccOptions, rng: Rng = Math.random): Question {
  const signs = [opts.sharpOn && 1, opts.flatOn && -1].filter(Boolean) as number[];
  const key = (1 + rand(MAX_KEY, rng)) * pick(signs, rng);
  // 高いド♯は鍵盤の外になるので出さない
  const cands = [0, 1, 2, 3, 4, 5, 6, 7].filter((n) => !(n === 7 && accOf(key, n) > 0));
  const marked = cands.filter((n) => accOf(key, n) !== 0);
  const plain = cands.filter((n) => accOf(key, n) === 0);
  const n = pick(rng() < 0.6 && marked.length ? marked : plain, rng);
  return { clef, n, key, acc: accOf(key, n) };
}

// 記号：ト音・ヘ音はその記号だけ、まぜるはト音5問・ヘ音5問
// 調号なし：ト音・ヘ音は8音を必ず1回ずつ＋ランダム2問、まぜるは音をランダム
// 調号あり：音と調号は上の accQuestion
// どれも、まったく同じ問題が続かないように並べる
export function makeQueue(
  m: Mode,
  opts: AccOptions,
  rng: Rng = Math.random
): Question[] {
  const accOn = opts.sharpOn || opts.flatOn;
  let items: Question[] = [];
  for (let tries = 0; tries < 200; tries++) {
    if (accOn) {
      const clefs = m === 'mix' ? halfAndHalf(rng) : Array<('treble' | 'bass')>(ROUND).fill(m);
      items = clefs.map((clef) => accQuestion(clef, opts, rng));
    } else if (m === 'mix') {
      items = halfAndHalf(rng).map((clef) => ({ clef, n: rand(8, rng), key: 0, acc: 0 }));
    } else {
      const bag = [0, 1, 2, 3, 4, 5, 6, 7];
      while (bag.length < ROUND) bag.push(rand(8, rng));
      items = shuffle(bag, rng).map((n) => ({ clef: m, n, key: 0, acc: 0 }));
    }
    if (items.every((q, i) => i === 0 || !sameQ(q, items[i - 1]))) break;
  }
  return items;
}
