import React, { useState } from 'react';
import { Song, NotationType } from '../../types/music';
import { getChordNotes, transposeChord } from '../../utils/musicTheory';

interface KeyboardViewProps {
  song: Song;
  uniqueChords: string[];
  semitoneOffset: number;
  notation: NotationType;
}

// 1.5 octave virtual mini keyboard (C3 to F4, 18 white keys + 12 black keys)
export const VirtualMiniPiano: React.FC<{ activeNotes: string[] }> = ({ activeNotes }) => {
  // Normalize active notes to standard pitch classes without octave (e.g. 'C', 'E', 'G')
  const noteSet = new Set(activeNotes.map(n => n.toUpperCase()));

  // 14 white keys spanning two octaves
  const whiteKeys = [
    { note: 'C', label: 'C' },
    { note: 'D', label: 'D' },
    { note: 'E', label: 'E' },
    { note: 'F', label: 'F' },
    { note: 'G', label: 'G' },
    { note: 'A', label: 'A' },
    { note: 'B', label: 'B' },
    { note: 'C', label: 'C' },
    { note: 'D', label: 'D' },
    { note: 'E', label: 'E' },
    { note: 'F', label: 'F' },
    { note: 'G', label: 'G' },
    { note: 'A', label: 'A' },
    { note: 'B', label: 'B' },
  ];

  // Black keys with their positions relative to white keys
  // indices: between 0-1 (C#), 1-2 (D#), 3-4 (F#), 4-5 (G#), 5-6 (A#), etc.
  const blackKeys = [
    { note: 'C#', alt: 'Db', index: 0 },
    { note: 'D#', alt: 'Eb', index: 1 },
    { note: 'F#', alt: 'Gb', index: 3 },
    { note: 'G#', alt: 'Ab', index: 4 },
    { note: 'A#', alt: 'Bb', index: 5 },
    { note: 'C#', alt: 'Db', index: 7 },
    { note: 'D#', alt: 'Eb', index: 8 },
    { note: 'F#', alt: 'Gb', index: 10 },
    { note: 'G#', alt: 'Ab', index: 11 },
    { note: 'A#', alt: 'Bb', index: 12 },
  ];

  const keyWidth = 18;
  const keyHeight = 70;
  const blackKeyWidth = 12;
  const blackKeyHeight = 44;

  return (
    <div className="inline-block p-2 bg-[#0c0c0c] border border-[#292929] rounded-md shadow-inner">
      <svg
        width={whiteKeys.length * keyWidth}
        height={keyHeight}
        className="select-none"
      >
        {/* Render White Keys */}
        {whiteKeys.map((k, idx) => {
          const isActive = noteSet.has(k.note);
          return (
            <rect
              key={`wk-${idx}`}
              x={idx * keyWidth}
              y={0}
              width={keyWidth - 1}
              height={keyHeight}
              rx={2}
              fill={isActive ? '#8BB8FF' : '#E5E5E5'}
              stroke="#292929"
              strokeWidth="1"
            />
          );
        })}

        {/* Render Black Keys */}
        {blackKeys.map((bk, idx) => {
          const isActive = noteSet.has(bk.note) || (bk.alt && noteSet.has(bk.alt));
          const x = (bk.index + 1) * keyWidth - blackKeyWidth / 2;
          return (
            <rect
              key={`bk-${idx}`}
              x={x}
              y={0}
              width={blackKeyWidth}
              height={blackKeyHeight}
              rx={1.5}
              fill={isActive ? '#60A5FA' : '#141414'}
              stroke="#292929"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
};

export const KeyboardView: React.FC<KeyboardViewProps> = ({
  song,
  uniqueChords,
  semitoneOffset,
  notation,
}) => {
  const tecladoData = song.instrumentsData?.teclado;
  const transposedChords = uniqueChords.map(c => transposeChord(c, semitoneOffset, notation));

  const [selectedChord, setSelectedChord] = useState<string>(
    transposedChords.length > 0 ? transposedChords[0] : ''
  );

  // If selectedChord changed due to transposition or was empty, keep it synced
  const activeChord = transposedChords.includes(selectedChord)
    ? selectedChord
    : transposedChords[0] || '';

  const chordInfo = activeChord ? getChordNotes(activeChord) : null;

  return (
    <div className="space-y-4 mb-6">
      {/* Keyboard Settings & Patch Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#141414] border border-[#292929] rounded-lg">
        <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
          <div>
            <span className="text-[#8BB8FF] font-medium">Timbre Sugerido: </span>
            <span className="text-white">{tecladoData?.synthPatch || 'Piano Acústico + Pad'}</span>
          </div>
          <span aria-hidden="true" className="text-[#292929]">·</span>
          <div>
            <span className="text-[#8BB8FF] font-medium">Notação: </span>
            <span className="text-white">{notation === 'latin' ? 'Dó, Ré, Mi (Latina)' : 'C, D, E (Anglo-Saxã)'}</span>
          </div>
        </div>
      </div>

      {/* Admin Execution Notes for Keyboard */}
      {(tecladoData?.notes || tecladoData?.keyNotes) && (
        <div className="p-3.5 bg-[#141414] border border-[#292929] rounded-lg text-sm text-[#E5E5E5] space-y-2">
          {tecladoData.notes && (
            <div>
              <div className="text-xs font-semibold text-[#8BB8FF] mb-1 uppercase tracking-wider">
                Orientações para o Teclado
              </div>
              <p className="text-xs text-[#E5E5E5] whitespace-pre-wrap">{tecladoData.notes}</p>
            </div>
          )}
          {tecladoData.keyNotes && (
            <div className="pt-2 border-t border-[#292929]">
              <div className="text-xs font-semibold text-[#A1A1AA] mb-1">Notas e Aberturas Cadastradas:</div>
              <p className="text-xs font-mono text-[#8BB8FF]">{tecladoData.keyNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Visual Chord Notes Inspector & Mini Piano */}
      {transposedChords.length > 0 && (
        <div className="p-4 bg-[#141414] border border-[#292929] rounded-lg">
          <div className="text-xs font-semibold text-[#A1A1AA] mb-3 uppercase tracking-wider">
            Notas dos Acordes & Teclas (Selecione um acorde)
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {transposedChords.map((chord) => {
              const isSelected = chord === activeChord;
              return (
                <button
                  key={chord}
                  onClick={() => setSelectedChord(chord)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                    isSelected
                      ? 'bg-[#8BB8FF] text-[#080808] font-bold shadow-sm'
                      : 'bg-[#1f1f1f] text-[#E5E5E5] hover:border-[#8BB8FF]/40 border border-[#292929]'
                  }`}
                >
                  {chord}
                </button>
              );
            })}
          </div>

          {chordInfo && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-3 border-t border-[#292929]">
              <div>
                <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>{activeChord}</span>
                  <span className="text-xs text-[#A1A1AA] font-normal">
                    (Fundamental: {notation === 'latin' ? chordInfo.latinNotes[0] : chordInfo.root})
                  </span>
                </div>
                <div className="text-xs text-[#A1A1AA] mt-1 flex items-center gap-1.5">
                  <span className="text-[#8BB8FF] font-medium">Notas componentes:</span>
                  <span className="text-white font-mono font-medium">
                    {notation === 'latin'
                      ? chordInfo.latinNotes.join(' · ')
                      : chordInfo.notes.join(' · ')}
                  </span>
                </div>
              </div>

              {/* Virtual Mini Piano */}
              <div className="overflow-x-auto max-w-full">
                <VirtualMiniPiano activeNotes={chordInfo.notes} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
