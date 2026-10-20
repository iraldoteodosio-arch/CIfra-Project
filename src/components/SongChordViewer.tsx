import React, { useMemo, useState } from 'react';
import { Song, NotationType } from '../types/music';
import { parseSongContent } from '../utils/chordParser';
import { transposeChord, getChordNotes } from '../utils/musicTheory';
import { ChordDiagram } from './ChordDiagram';
import { X, Sparkles } from 'lucide-react';

interface SongChordViewerProps {
  song: Song;
  semitoneOffset: number;
  notation: NotationType;
  fontSize: number; // in px, e.g. 16, 18, 20, 22...
}

export const SongChordViewer: React.FC<SongChordViewerProps> = ({
  song,
  semitoneOffset,
  notation,
  fontSize,
}) => {
  const [activeChordModal, setActiveChordModal] = useState<string | null>(null);

  const parsedLines = useMemo(() => {
    return parseSongContent(song.content);
  }, [song.content]);

  // If there's no content or empty lines
  const hasContent = parsedLines.some(l => l.type !== 'empty');

  if (!hasContent) {
    return (
      <div className="my-12 py-16 px-6 text-center border border-dashed border-[#292929] rounded-xl bg-[#0e0e0e]">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#141414] border border-[#292929] flex items-center justify-center text-[#8BB8FF]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#E5E5E5] mb-1">Conteúdo em preparação</h3>
        <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
          As letras, cifras e arranjos desta música ainda não foram inseridos pelo administrador.
        </p>
      </div>
    );
  }

  const activeChordInfo = activeChordModal ? getChordNotes(activeChordModal) : null;
  const capoNumber = song.capo || 0;

  return (
    <div
      className="space-y-4 font-sans select-text leading-relaxed transition-[font-size] duration-150 relative"
      style={{ fontSize: `${fontSize}px` }}
    >
      {parsedLines.map((line, lineIdx) => {
        if (line.type === 'empty') {
          return <div key={`empty-${lineIdx}`} className="h-4" />;
        }

        if (line.type === 'section') {
          return (
            <div
              key={`sec-${lineIdx}`}
              className="pt-4 pb-1 border-b border-[#292929]/80 flex items-center gap-2"
            >
              <span className="text-[0.75em] tracking-wider uppercase font-semibold text-[#8BB8FF]">
                {line.sectionName}
              </span>
            </div>
          );
        }

        if (line.type === 'chords-only') {
          return (
            <div
              key={`chords-only-${lineIdx}`}
              className="flex flex-wrap items-center gap-3 py-1 font-mono font-bold text-[#8BB8FF]"
              style={{ fontSize: `${Math.max(14, fontSize * 0.95)}px` }}
            >
              {line.tokens?.map((tok, tokIdx) => {
                const chordText = tok.chord
                  ? transposeChord(tok.chord, semitoneOffset, notation)
                  : '';
                return (
                  <button
                    key={`c-only-${tokIdx}`}
                    onClick={() => setActiveChordModal(chordText)}
                    className="px-2 py-0.5 rounded bg-[#141414] border border-[#292929] hover:border-[#8BB8FF] hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                    title={`Ver diagrama do acorde ${chordText}`}
                  >
                    {chordText}
                  </button>
                );
              })}
            </div>
          );
        }

        // line.type === 'chords-lyrics'
        return (
          <div
            key={`line-${lineIdx}`}
            className="flex flex-wrap items-baseline gap-y-2 py-0.5"
          >
            {line.tokens?.map((token, tokIdx) => {
              const chord = token.chord
                ? transposeChord(token.chord, semitoneOffset, notation)
                : null;

              if (chord) {
                return (
                  <span
                    key={`tok-${tokIdx}`}
                    className="inline-flex flex-col align-bottom mr-1 group"
                  >
                    {/* Chord in Matte Blue #8BB8FF positioned strictly above text */}
                    <button
                      type="button"
                      onClick={() => setActiveChordModal(chord)}
                      className="text-[#8BB8FF] hover:text-amber-400 font-mono font-bold text-[0.82em] leading-tight tracking-tight text-left cursor-pointer transition-colors"
                      style={{ minHeight: '1.2em' }}
                      title={`Clique para ver o diagrama de ${chord}`}
                    >
                      {chord}
                    </button>
                    {/* Lyric syllable in Matte White #E5E5E5 */}
                    <span className="text-[#E5E5E5] whitespace-pre">
                      {token.text || ' '}
                    </span>
                  </span>
                );
              }

              return (
                <span key={`tok-${tokIdx}`} className="inline-flex flex-col align-bottom mr-1">
                  {/* Empty spacer so syllables stay baseline aligned with chorded syllables */}
                  <span
                    className="text-transparent font-mono text-[0.82em] leading-tight select-none pointer-events-none"
                    style={{ minHeight: '1.2em' }}
                  >
                    &nbsp;
                  </span>
                  <span className="text-[#E5E5E5] whitespace-pre">
                    {token.text}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}

      {/* Floating Chord Inspector Modal on click */}
      {activeChordModal && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveChordModal(null)}
        >
          <div
            className="bg-[#141414] border border-[#292929] rounded-2xl p-5 shadow-2xl max-w-xs w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveChordModal(null)}
              className="absolute top-3 right-3 p-1 text-[#A1A1AA] hover:text-white rounded-lg transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#8BB8FF] font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagrama do Acorde</span>
            </div>

            <div className="flex justify-center mb-4">
              <ChordDiagram chord={activeChordModal} capo={capoNumber} />
            </div>

            {activeChordInfo && (
              <div className="pt-3 border-t border-[#292929] text-xs text-[#A1A1AA] space-y-1">
                <div>
                  <span className="text-[#8BB8FF] font-medium">Notas: </span>
                  <span className="text-white font-mono">
                    {notation === 'latin'
                      ? activeChordInfo.latinNotes.join(' · ')
                      : activeChordInfo.notes.join(' · ')}
                  </span>
                </div>
                <div>
                  <span className="text-[#8BB8FF] font-medium">Baixo: </span>
                  <span className="text-white font-mono">{activeChordInfo.bass}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveChordModal(null)}
              className="mt-4 w-full py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#262626] border border-[#292929] text-xs text-[#E5E5E5] font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
