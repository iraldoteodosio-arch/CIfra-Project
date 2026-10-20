export type InstrumentType = 'violao' | 'teclado' | 'baixo' | 'bateria';

export type NotationType = 'latin' | 'anglo'; // 'latin' = Dó, Ré, Mi... ; 'anglo' = C, D, E...

export interface Artist {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Collection {
  id: string;
  artistId: string;
  title: string;
  description: string;
  order: number;
}

export interface InstrumentDetails {
  notes?: string;
  tuning?: string;
  capo?: number;
  specificChords?: string;
  keyNotes?: string;
  bassLineNotes?: string;
  tempoFeel?: string;
  cues?: string;
  sectionsOutline?: string;
  synthPatch?: string;
  drumGrooveNotes?: string;
}

export interface Song {
  id: string;
  artistId: string;
  collectionId: string;
  title: string;
  slug: string;
  originalKey: string; // e.g. "G", "C", "D" or ""
  bpm?: number | null;
  timeSignature?: string | null; // e.g. "4/4", "6/8"
  capo?: number | null;
  content: string; // Structured lyrics & chords (ChordPro format [G]Letra or dual lines)
  structure?: string; // e.g. "Intro > V1 > Refrão > V2 > Refrão > Ponte > Final"
  observations?: string;
  status: 'draft' | 'published';
  order: number;
  createdAt: string;
  updatedAt: string;
  instrumentsData: {
    violao?: InstrumentDetails;
    teclado?: InstrumentDetails;
    baixo?: InstrumentDetails;
    bateria?: InstrumentDetails;
  };
}

export interface ChordToken {
  chord?: string;
  text: string;
}

export interface LyricLine {
  type: 'section' | 'chords-lyrics' | 'empty' | 'chords-only';
  sectionName?: string;
  tokens?: ChordToken[];
  rawLine?: string;
}
