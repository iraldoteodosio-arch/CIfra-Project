import React from 'react';
import { Song, NotationType } from '../../types/music';
import { getChordNotes, transposeChord } from '../../utils/musicTheory';

interface BassViewProps {
  song: Song;
  uniqueChords: string[];
  semitoneOffset: number;
  notation: NotationType;
}

export const BassView: React.FC<BassViewProps> = ({
  song,
  uniqueChords,
  semitoneOffset,
  notation,
}) => {
  const baixoData = song.instrumentsData?.baixo;
  const transposedChords = uniqueChords.map(c => transposeChord(c, semitoneOffset, notation));

  return (
    <div className="space-y-4 mb-6">
      {/* Bass Header & Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#141414] border border-[#292929] rounded-lg">
        <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
          <div>
            <span className="text-[#8BB8FF] font-medium">Instrumento: </span>
            <span className="text-white font-medium">Contrabaixo (4 / 5 cordas)</span>
          </div>
          <span aria-hidden="true" className="text-[#292929]">·</span>
          <div>
            <span className="text-[#8BB8FF] font-medium">Afinação: </span>
            <span className="text-white">{baixoData?.tuning || 'Padrão (E A D G)'}</span>
          </div>
        </div>
      </div>

      {/* Admin Notes / Lines for Bass */}
      {(baixoData?.notes || baixoData?.bassLineNotes) && (
        <div className="p-3.5 bg-[#141414] border border-[#292929] rounded-lg text-sm text-[#E5E5E5] space-y-2">
          {baixoData.notes && (
            <div>
              <div className="text-xs font-semibold text-[#8BB8FF] mb-1 uppercase tracking-wider">
                Orientações para o Baixo
              </div>
              <p className="text-xs text-[#E5E5E5] whitespace-pre-wrap">{baixoData.notes}</p>
            </div>
          )}
          {baixoData.bassLineNotes && (
            <div className="pt-2 border-t border-[#292929]">
              <div className="text-xs font-semibold text-[#A1A1AA] mb-1">Linhas de Baixo / Tablatura:</div>
              <pre className="text-xs font-mono bg-[#0c0c0c] p-2.5 rounded border border-[#292929] text-[#8BB8FF] overflow-x-auto">
                {baixoData.bassLineNotes}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Harmonic Guide: Fundamental Notes Strip */}
      {transposedChords.length > 0 && (
        <div className="p-4 bg-[#141414] border border-[#292929] rounded-lg">
          <div className="text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider">
            Referência Harmônica: Nota Fundamental e Baixo Invertido
          </div>
          <p className="text-xs text-[#A1A1AA] mb-3">
            O baixista deve prestar atenção nas notas graves dos acordes invertidos (ex: D/F# toca Fá#).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {transposedChords.map((chord, idx) => {
              const info = getChordNotes(chord);
              const bassNote = info?.bass || chord;
              const isSlash = chord.includes('/');

              return (
                <div
                  key={`${chord}-${idx}`}
                  className="p-2.5 bg-[#1a1a1a] border border-[#292929] rounded flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xs text-[#A1A1AA] font-mono">{chord}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xs text-[#8BB8FF] font-medium">Toca:</span>
                    <span className={`text-sm font-mono font-bold ${isSlash ? 'text-[#60A5FA]' : 'text-white'}`}>
                      {bassNote}
                    </span>
                  </div>
                  {isSlash && (
                    <span className="text-[10px] text-[#A1A1AA] mt-0.5">Inversão</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
