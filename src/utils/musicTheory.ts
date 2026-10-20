import { NotationType } from '../types/music';

// Chromatic scales
export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map note name to semitone index (0 to 11)
export const NOTE_INDEX_MAP: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

// Solfège / Latin name mapping
export const ANGLO_TO_LATIN: Record<string, string> = {
  'C': 'Dó', 'C#': 'Dó#', 'Db': 'Réb',
  'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mib',
  'E': 'Mi',
  'F': 'Fá', 'F#': 'Fá#', 'Gb': 'Solb',
  'G': 'Sol', 'G#': 'Sol#', 'Ab': 'Láb',
  'A': 'Lá', 'A#': 'Lá#', 'Bb': 'Sib',
  'B': 'Si',
};

export const LATIN_TO_ANGLO: Record<string, string> = {
  'Dó': 'C', 'Do': 'C', 'Dó#': 'C#', 'Do#': 'C#', 'Réb': 'Db', 'Reb': 'Db',
  'Ré': 'D', 'Re': 'D', 'Ré#': 'D#', 'Re#': 'D#', 'Mib': 'Eb',
  'Mi': 'E',
  'Fá': 'F', 'Fa': 'F', 'Fá#': 'F#', 'Fa#': 'F#', 'Solb': 'Gb',
  'Sol': 'G', 'Sol#': 'G#', 'Láb': 'Ab', 'Lab': 'Ab',
  'Lá': 'A', 'La': 'A', 'Lá#': 'A#', 'La#': 'A#', 'Sib': 'Bb',
  'Si': 'B',
};

// Regex to capture root note, quality, and optional bass note:
// e.g. "D/F#" -> root: "D", quality: "", bass: "F#"
// e.g. "Em7" -> root: "E", quality: "m7", bass: undefined
// e.g. "Bbmaj7/D" -> root: "Bb", quality: "maj7", bass: "D"
const CHORD_REGEX = /^([A-G][b#]?)([^/]*)(?:\/([A-G][b#]?))?$/;

/**
 * Transpose a single note by semitones
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const normNote = note.charAt(0).toUpperCase() + note.slice(1);
  const currentIndex = NOTE_INDEX_MAP[normNote];
  if (currentIndex === undefined) return note;

  const newIndex = (currentIndex + semitones + 120) % 12;
  const scale = preferFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  return scale[newIndex];
}

/**
 * Transpose a chord string (e.g. "D/F#", "Em7", "Gsus4")
 */
export function transposeChord(
  chord: string,
  semitones: number,
  notation: NotationType = 'anglo',
  preferFlats = false
): string {
  if (!chord || semitones === 0 && notation === 'anglo') {
    if (notation === 'latin') {
      return convertChordNotation(chord, 'latin');
    }
    return chord;
  }

  const trimmed = chord.trim();
  const match = trimmed.match(CHORD_REGEX);
  if (!match) return chord; // Not a standard chord format

  const [, root, quality, bass] = match;
  const newRoot = transposeNote(root, semitones, preferFlats);
  const newBass = bass ? transposeNote(bass, semitones, preferFlats) : null;

  let result = newBass ? `${newRoot}${quality}/${newBass}` : `${newRoot}${quality}`;

  if (notation === 'latin') {
    result = convertChordNotation(result, 'latin');
  }

  return result;
}

/**
 * Convert chord between Anglo (C, D, E...) and Latin (Dó, Ré, Mi...)
 */
export function convertChordNotation(chord: string, targetNotation: NotationType): string {
  if (!chord) return '';
  if (targetNotation === 'anglo') {
    let converted = chord;
    for (const [latin, anglo] of Object.entries(LATIN_TO_ANGLO)) {
      const reg = new RegExp(`^${latin}`, 'g');
      converted = converted.replace(reg, anglo);
      const slashReg = new RegExp(`\\/${latin}`, 'g');
      converted = converted.replace(slashReg, `/${anglo}`);
    }
    return converted;
  } else {
    const match = chord.match(CHORD_REGEX);
    if (!match) return chord;
    const [, root, quality, bass] = match;
    const latinRoot = ANGLO_TO_LATIN[root] || root;
    const latinBass = bass ? (ANGLO_TO_LATIN[bass] || bass) : null;
    return latinBass ? `${latinRoot}${quality}/${latinBass}` : `${latinRoot}${quality}`;
  }
}

/**
 * Calculate the notes that form a chord (useful for Keyboard & Bass)
 */
export interface ChordNotesInfo {
  root: string;
  bass: string;
  quality: string;
  notes: string[]; // Absolute note names (e.g. ['G', 'B', 'D'])
  latinNotes: string[]; // Latin names (e.g. ['Sol', 'Si', 'Ré'])
}

export function getChordNotes(chordStr: string): ChordNotesInfo | null {
  if (!chordStr) return null;
  const clean = chordStr.trim().replace(/[()]/g, '');
  const match = clean.match(CHORD_REGEX);
  if (!match) return null;

  const [, root, qualityRaw, bassRaw] = match;
  const rootIndex = NOTE_INDEX_MAP[root];
  if (rootIndex === undefined) return null;

  const quality = qualityRaw || '';
  const bass = bassRaw || root;

  // Relative intervals from root (in semitones)
  let intervals = [0, 4, 7]; // Major triad default

  if (quality.startsWith('m') && !quality.startsWith('maj')) {
    intervals = [0, 3, 7]; // Minor triad
  } else if (quality.includes('dim') || quality.includes('º')) {
    intervals = [0, 3, 6];
  } else if (quality.includes('aug') || quality.includes('+')) {
    intervals = [0, 4, 8];
  } else if (quality.includes('sus4') || quality.includes('4')) {
    intervals = [0, 5, 7];
  } else if (quality.includes('sus2') || quality.includes('2')) {
    intervals = [0, 2, 7];
  }

  // Extensions
  if (quality.includes('7M') || quality.includes('maj7')) {
    intervals.push(11);
  } else if (quality.includes('m7') || quality.includes('7')) {
    intervals.push(10);
  }
  if (quality.includes('6')) {
    intervals.push(9); // 6th
  }
  if (quality.includes('9') || quality.includes('add9')) {
    intervals.push(14); // 9th is 2 semitones up
  }
  if (quality.includes('11')) {
    intervals.push(17); // 11th
  }

  // Remove duplicate octave intervals and map to scale notes
  const uniqueSemitones = Array.from(new Set(intervals.map(i => (rootIndex + i) % 12)));
  const scale = CHROMATIC_SHARPS;
  const notes = uniqueSemitones.map(idx => scale[idx]);

  return {
    root,
    bass,
    quality,
    notes,
    latinNotes: notes.map(n => ANGLO_TO_LATIN[n] || n)
  };
}

export interface ChordFretData {
  frets: number[];
  fingers?: number[];
  baseFret?: number;
  barre?: { fret: number; fromString: number; toString: number };
}

/**
 * Common Guitar chord fretboard data for visual diagrams
 * Format: [E, A, D, G, B, e] where numbers are fret, -1 is mute (X), 0 is open
 */
export const GUITAR_CHORDS_DB: Record<string, ChordFretData> = {
  // C family
  'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'C9': { frets: [-1, 3, 2, 0, 3, 3], fingers: [0, 2, 1, 0, 3, 4] },
  'Cadd9': { frets: [-1, 3, 2, 0, 3, 3], fingers: [0, 2, 1, 0, 3, 4] },
  'C7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'C7M': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'C7M/G': { frets: [3, 3, 2, 0, 0, 0], fingers: [2, 3, 1, 0, 0, 0] },
  'C/E': { frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'C/G': { frets: [3, 3, 2, 0, 1, 0], fingers: [3, 4, 2, 0, 1, 0] },
  'Csus4': { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
  'Cm': { frets: [-1, 3, 5, 5, 4, 3], baseFret: 3, fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, fromString: 4, toString: 0 } },
  'C#': { frets: [-1, 4, 6, 6, 6, 4], baseFret: 4, fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 4, fromString: 4, toString: 0 } },
  'Db': { frets: [-1, 4, 6, 6, 6, 4], baseFret: 4, fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 4, fromString: 4, toString: 0 } },
  'C#m': { frets: [-1, 4, 6, 6, 5, 4], baseFret: 4, fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, fromString: 4, toString: 0 } },

  // D family
  'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 2, 3, 4] },
  'D/F#': { frets: [2, 0, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3] },
  'D4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  'Dsus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  'D4/F#': { frets: [2, 0, 0, 2, 3, 3], fingers: [1, 0, 0, 2, 3, 4] },
  'D4(6)/A': { frets: [-1, 0, 0, 2, 0, 3], fingers: [0, 0, 0, 1, 0, 2] },
  'D7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'D7M': { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'Dm7': { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  'Dm7(9)': { frets: [-1, -1, 0, 2, 1, 0], fingers: [0, 0, 0, 2, 1, 0] },
  'Dm9': { frets: [-1, -1, 0, 2, 1, 0], fingers: [0, 0, 0, 2, 1, 0] },
  'D#': { frets: [-1, 6, 8, 8, 8, 6], baseFret: 6, fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 6, fromString: 4, toString: 0 } },
  'Eb': { frets: [-1, 6, 8, 8, 8, 6], baseFret: 6, fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 6, fromString: 4, toString: 0 } },

  // E family
  'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'E7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'Em7': { frets: [0, 2, 2, 0, 3, 3], fingers: [0, 1, 2, 0, 3, 4] },
  'Em/B': { frets: [-1, 2, 2, 0, 0, 0], fingers: [0, 1, 2, 0, 0, 0] },
  'Em/D': { frets: [-1, -1, 0, 0, 0, 0] },
  'Esus4': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0] },

  // F family
  'F': { frets: [1, 3, 3, 2, 1, 1], baseFret: 1, fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, fromString: 5, toString: 0 } },
  'F9': { frets: [-1, -1, 3, 2, 1, 3], fingers: [0, 0, 3, 2, 1, 4] },
  'Fadd9': { frets: [-1, -1, 3, 2, 1, 3], fingers: [0, 0, 3, 2, 1, 4] },
  'F7M': { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  'F7M/C': { frets: [-1, 3, 3, 2, 1, 0], fingers: [0, 3, 4, 2, 1, 0] },
  'F#': { frets: [2, 4, 4, 3, 2, 2], baseFret: 2, fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 2, fromString: 5, toString: 0 } },
  'F#m': { frets: [2, 4, 4, 2, 2, 2], baseFret: 2, fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, fromString: 5, toString: 0 } },
  'F#m7': { frets: [2, 4, 2, 2, 2, 2], baseFret: 2, fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 2, fromString: 5, toString: 0 } },
  'Fm': { frets: [1, 3, 3, 1, 1, 1], baseFret: 1, fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, fromString: 5, toString: 0 } },

  // G family
  'G': { frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4] },
  'G4': { frets: [3, 2, 0, 0, 1, 3], fingers: [3, 2, 0, 0, 1, 4] },
  'G/B': { frets: [-1, 2, 0, 0, 3, 3], fingers: [0, 1, 0, 0, 3, 4] },
  'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'G7M': { frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },
  'Gsus4': { frets: [3, 3, 0, 0, 1, 3], fingers: [3, 4, 0, 0, 1, 4] },
  'Gm': { frets: [3, 5, 5, 3, 3, 3], baseFret: 3, fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, fromString: 5, toString: 0 } },
  'G#': { frets: [4, 6, 6, 5, 4, 4], baseFret: 4, fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 4, fromString: 5, toString: 0 } },
  'Ab': { frets: [4, 6, 6, 5, 4, 4], baseFret: 4, fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 4, fromString: 5, toString: 0 } },

  // A family
  'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'A7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
  'A7M': { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  'A9': { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
  'A/C#': { frets: [-1, 4, 2, 2, 2, 0], baseFret: 1, fingers: [0, 4, 1, 2, 3, 0] },
  'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'Am7': { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'Am7(9)': { frets: [-1, -1, 7, 9, 8, 7], fingers: [0, 0, 1, 3, 2, 1], baseFret: 7 },
  'Asus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'A#': { frets: [-1, 1, 3, 3, 3, 1], baseFret: 1, fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, fromString: 4, toString: 0 } },
  'Bb': { frets: [-1, 1, 3, 3, 3, 1], baseFret: 1, fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, fromString: 4, toString: 0 } },
  'Bbm': { frets: [-1, 1, 3, 3, 2, 1], baseFret: 1, fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, fromString: 4, toString: 0 } },

  // B family
  'B': { frets: [-1, 2, 4, 4, 4, 2], baseFret: 2, fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, fromString: 4, toString: 0 } },
  'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], baseFret: 2, fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, fromString: 4, toString: 0 } },
  'Bm7': { frets: [-1, 2, 0, 2, 0, 2], fingers: [0, 1, 0, 2, 0, 3] },
  'Bm11': { frets: [-1, 2, 4, 4, 2, 2], fingers: [0, 1, 3, 4, 1, 1], barre: { fret: 2, fromString: 4, toString: 0 } },
};

/**
 * Format chord diagram title matching the exact model: "D - Ré", "Am - Lá menor", "G/B - Sol/Si"
 */
export function getChordDiagramTitle(chord: string): string {
  if (!chord) return '';
  const clean = chord.trim();
  const match = clean.match(/^([A-G][b#]?)([^/]*)(?:\/([A-G][b#]?))?$/);
  if (!match) return clean;

  const [, root, quality, bass] = match;
  const latinRoot = ANGLO_TO_LATIN[root] || root;
  const latinBass = bass ? (ANGLO_TO_LATIN[bass] || bass) : null;

  let latinQuality = quality;
  if (!quality || quality === '') {
    latinQuality = '';
  } else if (quality === 'm') {
    latinQuality = ' menor';
  } else if (quality === 'm7') {
    latinQuality = ' menor 7';
  } else if (quality === 'm9') {
    latinQuality = ' menor 9';
  } else if (quality === 'm11') {
    latinQuality = ' menor 11';
  } else if (quality === '7') {
    latinQuality = ' 7';
  } else if (quality === '7M' || quality === 'maj7') {
    latinQuality = ' 7M';
  } else if (quality === '9') {
    latinQuality = ' 9';
  } else if (quality === '11') {
    latinQuality = ' 11';
  } else if (quality === '4' || quality === 'sus4') {
    latinQuality = ' 4';
  } else if (quality === '2' || quality === 'sus2') {
    latinQuality = ' 2';
  } else if (quality === '6') {
    latinQuality = ' 6';
  } else if (quality.startsWith('m') && !quality.startsWith('maj')) {
    latinQuality = ' menor ' + quality.slice(1);
  }

  const latinPart = latinBass
    ? `${latinRoot}${latinQuality}/${latinBass}`
    : `${latinRoot}${latinQuality}`;

  return `${clean} - ${latinPart}`.trim();
}

/**
 * Fallback generator for chords that might not be in the dictionary
 * or dynamically transposed
 */
export function getGuitarChordData(chordStr: string): ChordFretData | null {
  if (!chordStr) return null;
  const clean = chordStr.trim();
  if (GUITAR_CHORDS_DB[clean]) {
    return GUITAR_CHORDS_DB[clean];
  }

  // Strip parentheses if not found e.g. "Am7(9)" -> "Am7" or vice versa
  const withoutParens = clean.replace(/[()]/g, '');
  if (GUITAR_CHORDS_DB[withoutParens]) {
    return GUITAR_CHORDS_DB[withoutParens];
  }

  // Fallback to base chord if slash chord e.g. "G/D" -> fallback to "G" with custom bass
  if (clean.includes('/')) {
    const [base] = clean.split('/');
    if (GUITAR_CHORDS_DB[base]) {
      return GUITAR_CHORDS_DB[base];
    }
  }

  return null;
}
