import React from 'react';
import { Song } from '../../types/music';

interface DrumsViewProps {
  song: Song;
}

export const DrumsView: React.FC<DrumsViewProps> = ({ song }) => {
  const bateriaData = song.instrumentsData?.bateria;

  return (
    <div className="space-y-4 mb-6">
      {/* Tempo, BPM & Time Signature Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#141414] border border-[#292929] rounded-lg">
        <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
          {song.bpm ? (
            <div>
              <span className="text-[#8BB8FF] font-medium">Andamento: </span>
              <span className="text-white font-mono font-bold">{song.bpm} BPM</span>
            </div>
          ) : (
            <div>
              <span className="text-[#A1A1AA]">BPM não informado</span>
            </div>
          )}

          {song.timeSignature && (
            <>
              <span aria-hidden="true" className="text-[#292929]">·</span>
              <div>
                <span className="text-[#8BB8FF] font-medium">Compasso: </span>
                <span className="text-white font-mono">{song.timeSignature}</span>
              </div>
            </>
          )}

          {bateriaData?.tempoFeel && (
            <>
              <span aria-hidden="true" className="text-[#292929]">·</span>
              <div>
                <span className="text-[#8BB8FF] font-medium">Sensação: </span>
                <span className="text-white">{bateriaData.tempoFeel}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Structure & Roadmap */}
      {(song.structure || bateriaData?.sectionsOutline) && (
        <div className="p-4 bg-[#141414] border border-[#292929] rounded-lg">
          <div className="text-xs font-semibold text-[#8BB8FF] mb-2 uppercase tracking-wider">
            Estrutura da Música (Mapa de Dinâmica)
          </div>
          <div className="text-sm text-[#E5E5E5] font-mono bg-[#0c0c0c] p-3 rounded border border-[#292929]">
            {bateriaData?.sectionsOutline || song.structure}
          </div>
        </div>
      )}

      {/* Cues, Fills, Pauses & Dynamics */}
      {(bateriaData?.cues || bateriaData?.notes || bateriaData?.drumGrooveNotes) && (
        <div className="p-4 bg-[#141414] border border-[#292929] rounded-lg space-y-3">
          <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
            Orientações de Dinâmica, Viradas e Paradas
          </div>

          {bateriaData?.cues && (
            <div>
              <span className="text-xs font-semibold text-[#8BB8FF]">Viradas & Paradas:</span>
              <p className="text-xs text-[#E5E5E5] mt-1 whitespace-pre-wrap">{bateriaData.cues}</p>
            </div>
          )}

          {bateriaData?.notes && (
            <div className="pt-2 border-t border-[#292929]">
              <span className="text-xs font-semibold text-[#8BB8FF]">Orientações Gerais:</span>
              <p className="text-xs text-[#E5E5E5] mt-1 whitespace-pre-wrap">{bateriaData.notes}</p>
            </div>
          )}
        </div>
      )}

      {!bateriaData?.notes && !bateriaData?.cues && !song.structure && !song.bpm && (
        <div className="p-4 bg-[#141414] border border-[#292929] rounded-lg text-xs text-[#A1A1AA]">
          Nenhuma instrução específica de bateria ou andamento foi informada pelo administrador ainda.
        </div>
      )}
    </div>
  );
};
