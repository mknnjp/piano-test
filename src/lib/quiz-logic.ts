import { NOTE_POOL, type Clef, type NotePoolEntry } from './notes.js';

export interface QuizNote extends NotePoolEntry {
  clef: Clef;
}

export function pickRandomNote(rng: () => number = Math.random): QuizNote {
  const baseNote = NOTE_POOL[Math.floor(rng() * NOTE_POOL.length)];
  const clef: Clef = rng() > 0.5 ? 'treble' : 'bass';
  return { ...baseNote, clef };
}

export function checkAnswer(spelled: string, currentNote: QuizNote | null): boolean {
  if (!currentNote) {
    return false;
  }
  return spelled === currentNote.spelled;
}
