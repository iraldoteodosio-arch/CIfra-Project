import { LyricLine, ChordToken, NotationType } from '../types/music';
import { transposeChord } from './musicTheory';

// Regex to identify section headings: [Introdução], Intro], [Primeira parte], [Quarta parte], etc.
const SECTION_REGEX = /^\s*\[?(introdu[cç][aã]o|intro|primeira\s*parte|segunda\s*parte|terceira\s*parte|quarta\s*parte|quinta\s*parte|verso\s*\d*|refr[aã]o|coro|pr[eé]-refr[aã]o|ponte|bridge|instrumental|solo|interl[uú]dio|final|outro|coda|tag|estrofe\s*\d*)\]?\s*$/i;

// Regex to test if line starts with section label followed by chords, e.g. "Intro] Am  G/B C  | C G/B Am"
const SECTION_WITH_CHORDS_REGEX = /^\s*\[?(introdu[cç][aã]o|intro|primeira\s*parte|segunda\s*parte|terceira\s*parte|quarta\s*parte|refr[aã]o|coro|pr[eé]-refr[aã]o|ponte|bridge|instrumental|solo|final|outro)\]?\s*[:\-–—]?\s+(.+)$/i;

// Regex to test if a token looks like a chord (supports Bm11, D4(6)/A, C7M/G, Am7(9), D4/F#, etc.)
const CHORD_NAME_REGEX = /^[A-G][b#]?(?:m|maj|min|dim|aug|sus|add|[0-9\(\)\#\+ºM\-])*(?:\/[A-G][b#]?)?$/i;

/**
 * Checks if a line contains only chords (e.g. "G  D/F#  Em7  C", "( F7M/C  Am  D )", "| C G/B Am")
 */
export function isChordsOnlyLine(line: string): boolean {
  const clean = line.replace(/\[|\]|\(|\)/g, ' ').trim();
  if (!clean) return false;
  const parts = clean.split(/\s+/);
  return (
    parts.length > 0 &&
    parts.every(
      p =>
        CHORD_NAME_REGEX.test(p) ||
        p === '|' ||
        p === '||' ||
        p === '%' ||
        p === '/' ||
        p === '-' ||
        p === '–'
    )
  );
}

/**
 * Parses raw text into structured LyricLine objects
 * Supports bracket format: "[G]É tudo sobre [D/F#]você"
 * Supports section headers: "[Introdução]", "[Primeira parte]", "Intro]"
 * Supports traditional dual-line chord + lyric pairing
 */
export function parseSongContent(rawContent: string): LyricLine[] {
  if (!rawContent || !rawContent.trim()) {
    return [];
  }

  const rawLines = rawContent.split(/\r?\n/);
  const result: LyricLine[] = [];

  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push({ type: 'empty' });
      i++;
      continue;
    }

    // Check if line is a section heading followed directly by chords, e.g. "Intro] Am  G/B C  | C G/B Am"
    const sectionWithChordsMatch = trimmed.match(SECTION_WITH_CHORDS_REGEX);
    if (sectionWithChordsMatch) {
      const sectionName = sectionWithChordsMatch[1].trim();
      const chordPart = sectionWithChordsMatch[2].trim();
      result.push({
        type: 'section',
        sectionName: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        rawLine: `[${sectionName}]`,
      });
      if (chordPart) {
        const chords = chordPart
          .replace(/[()]/g, '')
          .split(/\s+/)
          .filter(Boolean)
          .map(c => ({ chord: c, text: ' ' }));
        result.push({
          type: 'chords-only',
          tokens: chords,
          rawLine: chordPart,
        });
      }
      i++;
      continue;
    }

    // Check if it's a standalone section header like "[Primeira parte]" or "Intro]"
    const sectionMatch = trimmed.match(SECTION_REGEX);
    if (sectionMatch) {
      const sectionName = trimmed.replace(/^\[|\]$/g, '').trim();
      result.push({
        type: 'section',
        sectionName: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        rawLine: trimmed,
      });
      i++;
      continue;
    }

    // Check if line uses inline bracket chords: e.g. "[G]É tudo [D/F#]sobre"
    if (line.includes('[') && line.includes(']')) {
      const tokens = parseBracketLine(line);
      result.push({
        type: 'chords-lyrics',
        tokens,
        rawLine: line,
      });
      i++;
      continue;
    }

    // Check if this line is chords-only
    if (isChordsOnlyLine(trimmed)) {
      const nextLine = i + 1 < rawLines.length ? rawLines[i + 1] : '';
      const nextTrimmed = nextLine.trim();

      // If next line is not empty and not chords-only and not section, pair them!
      if (
        nextTrimmed &&
        !isChordsOnlyLine(nextTrimmed) &&
        !nextTrimmed.match(SECTION_REGEX) &&
        !nextTrimmed.match(SECTION_WITH_CHORDS_REGEX)
      ) {
        const tokens = pairChordsAndLyricsLines(line, nextLine);
        result.push({
          type: 'chords-lyrics',
          tokens,
          rawLine: `${line}\n${nextLine}`,
        });
        i += 2;
        continue;
      } else {
        // Just standalone chords (e.g. "( F7M/C  Am  D )" or "Em")
        const cleanChords = trimmed
          .replace(/[()]/g, '')
          .split(/\s+/)
          .filter(Boolean)
          .map(c => ({ chord: c, text: ' ' }));
        result.push({
          type: 'chords-only',
          tokens: cleanChords,
          rawLine: line,
        });
        i++;
        continue;
      }
    }

    // Regular lyric line without chords
    result.push({
      type: 'chords-lyrics',
      tokens: [{ text: line }],
      rawLine: line,
    });
    i++;
  }

  return result;
}

/**
 * Parses a line containing bracketed chords, e.g. "[G]É tudo sobre [D/F#]você [Em7]"
 */
export function parseBracketLine(line: string): ChordToken[] {
  const tokens: ChordToken[] = [];
  const regex = /\[([^\]]+)\]([^\[]*)/g;
  let match;
  let lastIndex = 0;

  // Check if there is leading text before the first bracket
  const firstBracket = line.indexOf('[');
  if (firstBracket > 0) {
    tokens.push({ text: line.substring(0, firstBracket) });
  }

  while ((match = regex.exec(line)) !== null) {
    const chord = match[1].trim();
    const text = match[2];
    tokens.push({ chord, text });
    lastIndex = regex.lastIndex;
  }

  // If regex didn't match anything but there were brackets, fallback to plain text
  if (tokens.length === 0) {
    tokens.push({ text: line });
  }

  return tokens;
}

/**
 * Pairs a chords line and a lyrics line by character position
 */
export function pairChordsAndLyricsLines(chordLine: string, lyricLine: string): ChordToken[] {
  // Find all chords and their start indices
  const chordPositions: { chord: string; index: number }[] = [];
  const regex = /\S+/g;
  let match;

  while ((match = regex.exec(chordLine)) !== null) {
    chordPositions.push({
      chord: match[0],
      index: match.index,
    });
  }

  if (chordPositions.length === 0) {
    return [{ text: lyricLine }];
  }

  const tokens: ChordToken[] = [];

  // Check if lyric line starts before the first chord
  if (chordPositions[0].index > 0) {
    const preText = lyricLine.substring(0, chordPositions[0].index);
    if (preText) {
      tokens.push({ text: preText });
    }
  }

  for (let j = 0; j < chordPositions.length; j++) {
    const cur = chordPositions[j];
    const next = chordPositions[j + 1];
    const endIndex = next ? next.index : lyricLine.length;

    let segment = '';
    if (cur.index < lyricLine.length) {
      segment = lyricLine.substring(cur.index, Math.min(endIndex, lyricLine.length));
    }

    tokens.push({
      chord: cur.chord,
      text: segment || ' ',
    });
  }

  // If lyric line is longer than last chord position + segment
  const lastChord = chordPositions[chordPositions.length - 1];
  if (lastChord.index < lyricLine.length) {
    const remainder = lyricLine.substring(lyricLine.length);
    if (remainder) {
      tokens.push({ text: remainder });
    }
  }

  return tokens;
}

/**
 * Extract all unique chords found in parsed lines
 */
export function extractUniqueChords(lines: LyricLine[]): string[] {
  const chords = new Set<string>();
  for (const line of lines) {
    if (line.tokens) {
      for (const token of line.tokens) {
        if (token.chord && token.chord !== '|' && token.chord !== '||' && token.chord !== '%') {
          chords.add(token.chord.trim());
        }
      }
    }
  }
  return Array.from(chords);
}

/**
 * Convert traditional 2-line chords/lyrics text to bracket ChordPro text
 */
export function convertTraditionalToBracket(text: string): string {
  const parsed = parseSongContent(text);
  const output: string[] = [];

  for (const line of parsed) {
    if (line.type === 'empty') {
      output.push('');
    } else if (line.type === 'section') {
      output.push(`[${line.sectionName}]`);
    } else if (line.type === 'chords-only') {
      const chordsStr = line.tokens?.map(t => `[${t.chord}]`).join(' ') || '';
      output.push(chordsStr);
    } else if (line.tokens) {
      let lineStr = '';
      for (const t of line.tokens) {
        if (t.chord) {
          lineStr += `[${t.chord}]${t.text}`;
        } else {
          lineStr += t.text;
        }
      }
      output.push(lineStr);
    }
  }

  return output.join('\n');
}
