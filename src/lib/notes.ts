export type Accidental = '' | '♭' | '♮';

export interface NotePoolEntry {
  spelled: string;
  label: string;
  accidental: Accidental;
}

export type Clef = 'treble' | 'bass';

export interface StaffConfigEntry {
  name: string;
  clef: string;
  positionMap: Record<string, number>;
}

export interface StaffNote {
  step: number;
  name: string;
  label: string;
}

export interface StaffDataEntry {
  id: string;
  listId: string;
  name: string;
  clefSymbol: string;
  notes: StaffNote[];
}

export const NOTE_POOL: NotePoolEntry[] = [
  { spelled: 'C', label: 'ド / C', accidental: '' },
  { spelled: 'D♭', label: 'レ♭ / D♭', accidental: '♭' },
  { spelled: 'E♭', label: 'ミ♭ / E♭', accidental: '♭' },
  { spelled: 'E♮', label: 'ミ♮ / E♮', accidental: '♮' },
  { spelled: 'F', label: 'ファ / F', accidental: '' },
  { spelled: 'G♭', label: 'ソ♭ / G♭', accidental: '♭' },
  { spelled: 'G♮', label: 'ソ♮ / G♮', accidental: '♮' },
  { spelled: 'A♭', label: 'ラ♭ / A♭', accidental: '♭' },
  { spelled: 'B♭', label: 'シ♭ / B♭', accidental: '♭' }
];

export const STAFF_CONFIG: Record<Clef, StaffConfigEntry> = {
  treble: {
    name: 'ト音記号',
    clef: '𝄞',
    positionMap: {
      C: 5,
      'D♭': 6,
      'E♭': 7,
      'E♮': 7,
      F: 1,
      'G♭': 2,
      'G♮': 2,
      'A♭': 3,
      'B♭': 4
    }
  },
  bass: {
    name: 'ヘ音記号',
    clef: '𝄢',
    positionMap: {
      C: 3,
      'D♭': 4,
      'E♭': 5,
      'E♮': 5,
      F: 6,
      'G♭': 7,
      'G♮': 7,
      'A♭': 8,
      'B♭': 9
    }
  }
};

export const staffData: StaffDataEntry[] = [
  {
    id: 'treble-staff',
    listId: 'treble-list',
    name: 'ト音記号',
    clefSymbol: '',
    notes: [
      { step: 0, name: 'ファ', label: 'F5' },
      { step: 1, name: 'ミ', label: 'E5' },
      { step: 2, name: 'レ', label: 'D5' },
      { step: 3, name: 'ド', label: 'C5' },
      { step: 4, name: 'シ', label: 'B4' },
      { step: 5, name: 'ラ', label: 'A4' },
      { step: 6, name: 'ソ', label: 'G4' },
      { step: 7, name: 'ファ', label: 'F4' },
      { step: 8, name: 'ミ', label: 'E4' }
    ]
  },
  {
    id: 'bass-staff',
    listId: 'bass-list',
    name: 'ヘ音記号',
    clefSymbol: '',
    notes: [
      { step: 0, name: 'ラ', label: 'A3' },
      { step: 1, name: 'ソ', label: 'G3' },
      { step: 2, name: 'ファ', label: 'F3' },
      { step: 3, name: 'ミ', label: 'E3' },
      { step: 4, name: 'レ', label: 'D3' },
      { step: 5, name: 'ド', label: 'C3' },
      { step: 6, name: 'シ', label: 'B2' },
      { step: 7, name: 'ラ', label: 'A2' },
      { step: 8, name: 'ソ', label: 'G2' }
    ]
  }
];
