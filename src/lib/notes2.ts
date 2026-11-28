import { G_CLEF, F_CLEF } from './glyphs.js';

export type Clef = 'treble' | 'bass';
export type Mode = Clef | 'mix';

export interface ClefDef {
  d: string;
  shift: number;
  octave: number;
  sigX: number;
  sigShift: number;
  name: string;
}

export interface NoteDef {
  name: string;
  short?: string;
  long?: string;
  step: number;
  letter: string;
}

export interface BlackKeyDef {
  semi: number;
  after: number;
  sharp: [string, string];
  flat: [string, string];
}

// shift: 音符の位置のずれ / octave: 鳴らす音の高さ / sigX: 調号の書き始め / sigShift: 調号の位置のずれ
// ト音記号は ド4〜ド5、ヘ音記号は ド3〜ド4（真ん中のド）
export const CLEFS: Record<Clef, ClefDef> = {
  treble: { d: G_CLEF, shift: 0, octave: 1, sigX: 70, sigShift: 0, name: 'ト音記号' },
  bass: { d: F_CLEF, shift: 5, octave: 0.5, sigX: 76, sigShift: -2, name: 'ヘ音記号' },
};

export const MODES: readonly Mode[] = ['treble', 'bass', 'mix'];

// step: 第1線を0として、線と間を1つずつ数えた位置（ト音記号のとき）
export const NOTES: readonly NoteDef[] = [
  { name: 'ド', short: '低いド', long: '低いほうのド', step: -2, letter: 'C' },
  { name: 'レ', step: -1, letter: 'D' },
  { name: 'ミ', step: 0, letter: 'E' },
  { name: 'ファ', step: 1, letter: 'F' },
  { name: 'ソ', step: 2, letter: 'G' },
  { name: 'ラ', step: 3, letter: 'A' },
  { name: 'シ', step: 4, letter: 'B' },
  { name: 'ド', short: '高いド', long: '高いほうのド', step: 5, letter: 'C' },
];

// 白鍵：低いドからの半音の数
export const WHITE_SEMI: readonly number[] = [0, 2, 4, 5, 7, 9, 11, 12];

// 黒鍵：after = 何本目の白鍵の右か
export const BLACK_KEYS: readonly BlackKeyDef[] = [
  { semi: 1, after: 1, sharp: ['ド', '♯'], flat: ['レ', '♭'] },
  { semi: 3, after: 2, sharp: ['レ', '♯'], flat: ['ミ', '♭'] },
  { semi: 6, after: 4, sharp: ['ファ', '♯'], flat: ['ソ', '♭'] },
  { semi: 8, after: 5, sharp: ['ソ', '♯'], flat: ['ラ', '♭'] },
  { semi: 10, after: 6, sharp: ['ラ', '♯'], flat: ['シ', '♭'] },
];

// 調号：♯は ファ→ド→ソ→レ…、♭は シ→ミ→ラ→レ… の順につく
export const MAX_KEY = 4;                            // ♯・♭は4つまで
export const SHARP_ORDER: readonly string[] = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
export const FLAT_ORDER: readonly string[] = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
export const SHARP_POS: readonly number[] = [8, 5, 9, 6, 3, 7, 4];
export const FLAT_POS: readonly number[] = [4, 7, 3, 6, 2, 5, 1];
export const SHARP_STEP = 19;
export const FLAT_STEP = 17;        // 並べる間隔(px)

export const KEY_SEMI: Record<string, number> = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12,
};
