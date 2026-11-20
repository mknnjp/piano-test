import { describe, it, expect } from 'vitest';
import { NOTE_POOL, STAFF_CONFIG, staffData } from '../src/lib/notes.js';

describe('NOTE_POOL と STAFF_CONFIG の整合性', () => {
  it('NOTE_POOL の全 spelled が treble の positionMap に存在する', () => {
    NOTE_POOL.forEach((note) => {
      expect(STAFF_CONFIG.treble.positionMap).toHaveProperty(note.spelled);
    });
  });

  it('NOTE_POOL の全 spelled が bass の positionMap に存在する', () => {
    NOTE_POOL.forEach((note) => {
      expect(STAFF_CONFIG.bass.positionMap).toHaveProperty(note.spelled);
    });
  });

  it('NOTE_POOL の spelled は一意である', () => {
    const spelled = NOTE_POOL.map((note) => note.spelled);
    expect(new Set(spelled).size).toBe(spelled.length);
  });

  it('NOTE_POOL の label は一意である', () => {
    const labels = NOTE_POOL.map((note) => note.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('accidental は空文字・♭・♮ のいずれかである', () => {
    NOTE_POOL.forEach((note) => {
      expect(['', '♭', '♮']).toContain(note.accidental);
    });
  });
});

describe('staffData の整合性', () => {
  it('treble と bass の2件が定義されている', () => {
    expect(staffData.map((entry) => entry.id)).toEqual(['treble-staff', 'bass-staff']);
  });

  it('各 notes の step は 0 から 8 の範囲で一意である', () => {
    staffData.forEach((entry) => {
      const steps = entry.notes.map((note) => note.step);
      expect(new Set(steps).size).toBe(steps.length);
      steps.forEach((step) => {
        expect(step).toBeGreaterThanOrEqual(0);
        expect(step).toBeLessThanOrEqual(8);
      });
    });
  });
});
