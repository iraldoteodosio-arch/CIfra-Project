import React, { useState } from 'react';
import { Song, NotationType } from '../../types/music';
import { transposeChord } from '../../utils/musicTheory';
import { ChordDiagram } from '../ChordDiagram';
import { ChevronDown, ChevronUp } from 'lucide-react';

export { ChordDiagram as GuitarChordDiagram } from '../ChordDiagram';

interface GuitarViewProps {
  song: Song;
  uniqueChords: string[];
  semitoneOffset: number;
  notation: NotationType;
}

export const GuitarView: React.FC<GuitarViewProps> = ({
  song,
  uniqueChords,
  semitoneOffset,
  notation,
}) => {
  const [showDiagrams, setShowDiagrams] = useState(true);
  const violaoData = song.instrumentsData?.violao;
  const capoNumber = song.capo !== undefined && song.capo !== null ? song.capo : violaoData?.capo;

  const transposedChords = uniqueChords.map(c => transposeChord(c, semitoneOffset, notation));

  return (
    <div className="space-y-4 mb-6">
      {/* Violão Settings & Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#141414] border border-[#292929] rounded-xl">
        <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
          <div>
            <span className="text-[#8BB8FF] font-medium">Capotraste: </span>
            {capoNumber && capoNumber > 0 ? (
              <span className="text-white font-medium">{capoNumber}ª casa</span>
            ) : (
              <span>Não utiliza</span>
            )}
          </div>
          <span aria-hidden="true" className="text-[#292929]">·</span>
          <div>
            <span className="text-[#8BB8FF] font-medium">Afinação: </span>
            <span className="text-white">{violaoData?.tuning || 'Padrão (E A D G B E)'}</span>
          </div>
        </div>

        {transposedChords.length > 0 && (
          <button
            onClick={() => setShowDiagrams(!showDiagrams)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1f1f1f] border border-[#292929] hover:border-[#8BB8FF]/40 text-[#E5E5E5] transition-colors"
          >
            <span>{showDiagrams ? 'Ocultar Diagramas' : 'Exibir Diagramas'}</span>
            {showDiagrams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Specific Guitar Notes from Admin */}
      {violaoData?.notes && (
        <div className="p-3.5 bg-[#141414] border border-[#292929] rounded-xl text-sm text-[#E5E5E5] leading-relaxed">
          <div className="text-xs font-semibold text-[#8BB8FF] mb-1 uppercase tracking-wider">
            Orientações para o Violão
          </div>
          <p className="text-xs text-[#E5E5E5] whitespace-pre-wrap">{violaoData.notes}</p>
        </div>
      )}

      {/* Chord Fretboard Diagram Strip (Matching Attached Image: Title, Capo pill, Coral dots, P I M A) */}
      {showDiagrams && transposedChords.length > 0 && (
        <div className="bg-[#101010] border border-[#292929] rounded-2xl p-4 md:p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#242424]">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-white">
                Acordes para violão e guitarra
              </span>
              <span className="text-xs text-[#A1A1AA]">
                ({transposedChords.length})
              </span>
            </div>

            {capoNumber && capoNumber > 0 && (
              <span className="text-[11px] text-[#F26535] font-semibold">
                Capotraste na {capoNumber}ª casa
              </span>
            )}
          </div>

          {/* Horizontal scrollable row of chords */}
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
            {transposedChords.map((chord, idx) => (
              <ChordDiagram
                key={`${chord}-${idx}`}
                chord={chord}
                capo={capoNumber || 0}
              />
            ))}
          </div>

          {/* Legend explaining P I M A */}
          <div className="mt-2 pt-3 border-t border-[#1f1f1f] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#A1A1AA]">
            <div className="flex items-center gap-3">
              <span className="text-[#8BB8FF] font-medium">Dedos da mão direita (dedilhado):</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-black text-white border border-white text-[9px] font-bold">P</span>
                <span>Polegar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-400 text-black text-[9px] font-bold">I</span>
                <span>Indicador</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-400 text-black text-[9px] font-bold">M</span>
                <span>Médio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-400 text-black text-[9px] font-bold">A</span>
                <span>Anelar</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#F26535] text-white text-[9px] font-bold">1-4</span>
              <span>Dedos da mão esquerda</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
