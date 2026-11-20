import { describe, it, expect } from 'vitest';
import { pickRandomNote, checkAnswer, type QuizNote } from '../src/lib/quiz-logic.js';
import { NOTE_POOL } from '../src/lib/notes.js';

describe('pickRandomNote', () => {
  it('rng が 0 を返すとき、先頭の音と bass を返す', () => {
    const note = pickRandomNote(() => 0);
    expect(note.spelled).toBe(NOTE_POOL[0].spelled);
    expect(note.clef).toBe('bass');
  });

  it('rng が 0.999 を返すとき、末尾の音と treble を返す', () => {
    const note = pickRandomNote(() => 0.999);
    expect(note.spelled).toBe(NOTE_POOL[NOTE_POOL.length - 1].spelled);
    expect(note.clef).toBe('treble');
  });

  it('clef の判定は rng() > 0.5 で treble になる', () => {
    const values = [0.1, 0.5, 0.5001, 0.9];
    const clefs = values.map((v) => pickRandomNote(() => v).clef);
    expect(clefs).toEqual(['bass', 'bass', 'treble', 'treble']);
  });

  it('返り値は NOTE_POOL の音を含み、元のオブジェクトを変更しない', () => {
    const note = pickRandomNote(() => 0.3);
    expect(NOTE_POOL).toContainEqual(
      expect.objectContaining({ spelled: note.spelled })
    );
    expect(note).not.toBe(NOTE_POOL[0]);
  });
});

describe('checkAnswer', () => {
  const currentNote: QuizNote = { spelled: 'E♭', label: 'ミ♭ / E♭', accidental: '♭', clef: 'treble' };

  it('一致する場合は true を返す', () => {
    expect(checkAnswer('E♭', currentNote)).toBe(true);
  });

  it('一致しない場合は false を返す', () => {
    expect(checkAnswer('E♮', currentNote)).toBe(false);
  });

  it('currentNote が null の場合は false を返す', () => {
    expect(checkAnswer('E♭', null)).toBe(false);
  });
});
