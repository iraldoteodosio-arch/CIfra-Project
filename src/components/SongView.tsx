import React, { useState, useMemo } from 'react';
import { Song, InstrumentType, NotationType } from '../types/music';
import { extractUniqueChords, parseSongContent } from '../utils/chordParser';
import { transposeNote, transposeChord } from '../utils/musicTheory';
import { SongChordViewer } from './SongChordViewer';
import { ChordDiagram } from './ChordDiagram';
import { GuitarView } from './instruments/GuitarView';
import { KeyboardView } from './instruments/KeyboardView';
import { BassView } from './instruments/BassView';
import { DrumsView } from './instruments/DrumsView';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  Minimize2,
  Printer,
  RotateCcw,
  Plus,
  Minus,
  SlidersHorizontal,
} from 'lucide-react';

interface SongViewProps {
  song: Song;
  allSongs: Song[];
  isFavorite: boolean;
  onToggleFavorite: (songId: string) => void;
  onSelectSong: (songId: string) => void;
  onBack: () => void;
}

export const SongView: React.FC<SongViewProps> = ({
  song,
  allSongs,
  isFavorite,
  onToggleFavorite,
  onSelectSong,
  onBack,
}) => {
  // Instrument selection
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('violao');

  // Key transposition (-11 to +11 semitones)
  const [semitoneOffset, setSemitoneOffset] = useState<number>(0);

  // Notation preference: 'anglo' (C, D, E) or 'latin' (Dó, Ré, Mi)
  const [notation, setNotation] = useState<NotationType>('anglo');

  // Font size in pixels (default 18px for stage readability)
  const [fontSize, setFontSize] = useState<number>(18);

  // Rehearsal Mode (distraction-free, clean stage view)
  const [isRehearsalMode, setIsRehearsalMode] = useState<boolean>(false);

  // Show/hide chord diagrams section
  const [showSongChords, setShowSongChords] = useState<boolean>(true);

  // Unique chords detected in the song
  const uniqueChords = useMemo(() => {
    const parsed = parseSongContent(song.content);
    return extractUniqueChords(parsed);
  }, [song.content]);

  // Capo number
  const capoNumber = song.capo !== undefined && song.capo !== null ? song.capo : song.instrumentsData?.violao?.capo;

  // Current key calculation
  const currentKey = useMemo(() => {
    if (!song.originalKey) return '';
    return transposeNote(song.originalKey, semitoneOffset);
  }, [song.originalKey, semitoneOffset]);

  // Previous & Next navigation
  const currentIndex = allSongs.findIndex((s) => s.id === song.id);
  const prevSong = currentIndex > 0 ? allSongs[currentIndex - 1] : null;
  const nextSong = currentIndex < allSongs.length - 1 ? allSongs[currentIndex + 1] : null;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen bg-[#080808] text-[#E5E5E5] ${isRehearsalMode ? 'p-4 md:p-8' : 'pb-24'}`}>
      {/* Top Bar / Navigation when not in rehearsal mode */}
      {!isRehearsalMode && (
        <header className="no-print sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-[#292929] px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Repertório</span>
            </button>

            {/* Quick Actions (Favorite, Rehearsal, Print) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(song.id)}
                className={`p-2 rounded-lg border border-[#292929] transition-colors ${
                  isFavorite
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-[#141414] text-[#A1A1AA] hover:text-white'
                }`}
                title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                aria-label="Favoritar"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
              </button>

              <button
                onClick={() => setIsRehearsalMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#292929] hover:border-[#8BB8FF]/40 text-xs text-[#E5E5E5] transition-colors"
                title="Modo Ensaio (Tela limpa para palco)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#8BB8FF]" />
                <span className="hidden sm:inline">Modo Ensaio</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-[#141414] border border-[#292929] text-[#A1A1AA] hover:text-white transition-colors"
                title="Imprimir Cifra Simplificada"
                aria-label="Imprimir"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Floating Exit for Rehearsal Mode */}
      {isRehearsalMode && (
        <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#141414]/90 backdrop-blur border border-[#292929] rounded-lg p-1">
            <button
              onClick={() => setFontSize((f) => Math.max(12, f - 2))}
              className="p-1.5 hover:bg-[#202020] rounded text-[#A1A1AA] hover:text-white text-xs font-mono"
              title="Diminuir fonte"
            >
              A-
            </button>
            <span className="text-[11px] font-mono text-[#8BB8FF] px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(32, f + 2))}
              className="p-1.5 hover:bg-[#202020] rounded text-[#A1A1AA] hover:text-white text-xs font-mono"
              title="Aumentar fonte"
            >
              A+
            </button>
          </div>

          <button
            onClick={() => setIsRehearsalMode(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141414]/90 backdrop-blur border border-[#292929] text-xs font-medium text-[#E5E5E5] hover:bg-[#202020] transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5 text-[#8BB8FF]" />
            <span>Sair do Modo Ensaio</span>
          </button>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* Song Header */}
        <section className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA] mb-1">
            <span>Morada</span>
            <span aria-hidden="true">·</span>
            <span>Música {song.order} de {allSongs.length}</span>
            {song.status === 'draft' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">Rascunho</span>
              </>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            {song.title}
          </h1>

          {/* Quick metadata line */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#A1A1AA] pt-1">
            {song.originalKey ? (
              <div>
                <span className="text-[#8BB8FF]">Tom original: </span>
                <span className="font-mono font-bold text-white">{song.originalKey}</span>
              </div>
            ) : (
              <span>Tom original não definido</span>
            )}

            {song.bpm ? (
              <>
                <span aria-hidden="true" className="text-[#292929]">·</span>
                <div>
                  <span className="text-[#8BB8FF]">BPM: </span>
                  <span className="font-mono font-medium text-white">{song.bpm}</span>
                </div>
              </>
            ) : null}

            {song.timeSignature ? (
              <>
                <span aria-hidden="true" className="text-[#292929]">·</span>
                <div>
                  <span className="text-[#8BB8FF]">Compasso: </span>
                  <span className="font-mono font-medium text-white">{song.timeSignature}</span>
                </div>
              </>
            ) : null}
          </div>

          {song.observations && (
            <p className="mt-3 text-xs text-[#A1A1AA] bg-[#141414] p-3 rounded-lg border border-[#292929]">
              <strong className="text-[#8BB8FF] font-semibold">Observação: </strong>
              {song.observations}
            </p>
          )}
        </section>

        {/* Instrumental Tabs & Controls toolbar (Hidden in print) */}
        <section className="no-print space-y-4 mb-6">
          {/* 4 Instruments Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#141414] border border-[#292929] rounded-xl">
            {(
              [
                { id: 'violao', label: 'Violão' },
                { id: 'teclado', label: 'Teclado' },
                { id: 'baixo', label: 'Baixo' },
                { id: 'bateria', label: 'Bateria' },
              ] as const
            ).map((inst) => {
              const active = selectedInstrument === inst.id;
              return (
                <button
                  key={inst.id}
                  onClick={() => setSelectedInstrument(inst.id)}
                  className={`py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors ${
                    active
                      ? 'bg-[#1f1f1f] text-white border border-[#8BB8FF]/30 shadow-sm'
                      : 'text-[#A1A1AA] hover:text-[#E5E5E5]'
                  }`}
                >
                  {inst.label}
                </button>
              );
            })}
          </div>

          {/* Transposition & Controls Bar */}
          <div className="p-3.5 bg-[#141414] border border-[#292929] rounded-xl flex flex-wrap items-center justify-between gap-4">
            {/* Transposition controls */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8BB8FF]" />
                Tom:
              </span>

              <div className="flex items-center gap-1 bg-[#0c0c0c] border border-[#292929] rounded-lg p-0.5">
                <button
                  onClick={() => setSemitoneOffset((s) => s - 1)}
                  className="p-1.5 hover:bg-[#1a1a1a] rounded text-[#A1A1AA] hover:text-white"
                  title="Diminuir meio tom (-1 semitom)"
                  aria-label="Diminuir meio tom"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="px-2.5 text-center min-w-[56px]">
                  <div className="text-xs font-mono font-bold text-white">
                    {currentKey || (semitoneOffset === 0 ? 'Original' : `${semitoneOffset > 0 ? '+' : ''}${semitoneOffset}`)}
                  </div>
                  {semitoneOffset !== 0 && (
                    <div className="text-[10px] font-mono text-[#8BB8FF]">
                      {semitoneOffset > 0 ? `+${semitoneOffset}` : semitoneOffset} semitons
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSemitoneOffset((s) => s + 1)}
                  className="p-1.5 hover:bg-[#1a1a1a] rounded text-[#A1A1AA] hover:text-white"
                  title="Aumentar meio tom (+1 semitom)"
                  aria-label="Aumentar meio tom"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {semitoneOffset !== 0 && (
                <button
                  onClick={() => setSemitoneOffset(0)}
                  className="p-1.5 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#1f1f1f] rounded"
                  title="Restaurar tom original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Font Size & Notation toggles */}
            <div className="flex items-center gap-4 text-xs">
              {/* Notation Toggle */}
              <div className="flex items-center gap-1 bg-[#0c0c0c] border border-[#292929] rounded-lg p-0.5">
                <button
                  onClick={() => setNotation('anglo')}
                  className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                    notation === 'anglo'
                      ? 'bg-[#1f1f1f] text-white font-bold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                  title="C, D, E..."
                >
                  C D E
                </button>
                <button
                  onClick={() => setNotation('latin')}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    notation === 'latin'
                      ? 'bg-[#1f1f1f] text-white font-bold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                  title="Dó, Ré, Mi..."
                >
                  Dó Ré Mi
                </button>
              </div>

              {/* Font scaling buttons */}
              <div className="flex items-center gap-1 bg-[#0c0c0c] border border-[#292929] rounded-lg p-0.5">
                <button
                  onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                  className="px-2 py-1 hover:bg-[#1a1a1a] rounded text-[#A1A1AA] hover:text-white font-mono"
                  title="Diminuir tamanho da letra"
                >
                  A-
                </button>
                <span className="text-[11px] font-mono text-[#8BB8FF] px-1">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((f) => Math.min(32, f + 2))}
                  className="px-2 py-1 hover:bg-[#1a1a1a] rounded text-[#A1A1AA] hover:text-white font-mono"
                  title="Aumentar tamanho da letra"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Instrument Specific Details View */}
        <section className="no-print">
          {selectedInstrument === 'violao' && (
            <GuitarView
              song={song}
              uniqueChords={uniqueChords}
              semitoneOffset={semitoneOffset}
              notation={notation}
            />
          )}

          {selectedInstrument === 'teclado' && (
            <KeyboardView
              song={song}
              uniqueChords={uniqueChords}
              semitoneOffset={semitoneOffset}
              notation={notation}
            />
          )}

          {selectedInstrument === 'baixo' && (
            <BassView
              song={song}
              uniqueChords={uniqueChords}
              semitoneOffset={semitoneOffset}
              notation={notation}
            />
          )}

          {selectedInstrument === 'bateria' && (
            <DrumsView song={song} />
          )}
        </section>

        {/* Main Lyrics & Chords Section */}
        <section className="mt-6 pt-4 border-t border-[#292929]">
          <div className="flex items-center justify-between gap-3 mb-4 no-print">
            <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Letra e Cifras Sincronizadas
            </div>

            {uniqueChords.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSongChords(!showSongChords)}
                className="flex items-center gap-1.5 text-xs text-[#8BB8FF] hover:text-white px-2.5 py-1 rounded-lg bg-[#141414] border border-[#292929] hover:border-[#8BB8FF]/40 transition-colors"
                title="Exibir ou ocultar a grade de diagramas dos acordes desta música"
              >
                <span>{showSongChords ? 'Ocultar Diagramas' : 'Exibir Diagramas dos Acordes'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1f1f1f] text-white font-mono">
                  {uniqueChords.length}
                </span>
              </button>
            )}
          </div>

          {/* Quick Chord Diagrams strip for all songs with chords (Exact model from image) */}
          {showSongChords && uniqueChords.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-[#101010] border border-[#292929] no-print">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>Diagramas dos Acordes</span>
                  <span className="text-xs text-[#A1A1AA] font-normal">
                    ({uniqueChords.length} acordes na tonalidade {currentKey || song.originalKey || 'atual'})
                  </span>
                </span>
                {capoNumber && capoNumber > 0 ? (
                  <span className="text-[#EE602B] font-bold text-[11px]">
                    Capotraste: {capoNumber}ª casa
                  </span>
                ) : null}
              </div>

              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
                {uniqueChords.map((c, idx) => (
                  <ChordDiagram
                    key={`song-chord-${c}-${idx}`}
                    chord={transposeChord(c, semitoneOffset, notation)}
                    capo={capoNumber || 0}
                  />
                ))}
              </div>
            </div>
          )}

          <SongChordViewer
            song={song}
            semitoneOffset={semitoneOffset}
            notation={notation}
            fontSize={fontSize}
          />
        </section>

        {/* Bottom Navigation (Previous / Next Song) */}
        {!isRehearsalMode && (
          <nav className="no-print mt-12 pt-6 border-t border-[#292929] flex items-center justify-between gap-4">
            {prevSong ? (
              <button
                onClick={() => {
                  setSemitoneOffset(0);
                  onSelectSong(prevSong.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 p-3 bg-[#141414] hover:bg-[#1a1a1a] border border-[#292929] rounded-xl text-left transition-colors max-w-[45%]"
              >
                <ChevronLeft className="w-4 h-4 text-[#8BB8FF] shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] uppercase text-[#A1A1AA]">Anterior ({prevSong.order})</div>
                  <div className="text-xs font-semibold text-white truncate">{prevSong.title}</div>
                </div>
              </button>
            ) : <div />}

            {nextSong ? (
              <button
                onClick={() => {
                  setSemitoneOffset(0);
                  onSelectSong(nextSong.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 p-3 bg-[#141414] hover:bg-[#1a1a1a] border border-[#292929] rounded-xl text-right transition-colors max-w-[45%]"
              >
                <div className="truncate">
                  <div className="text-[10px] uppercase text-[#A1A1AA]">Próxima ({nextSong.order})</div>
                  <div className="text-xs font-semibold text-white truncate">{nextSong.title}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8BB8FF] shrink-0" />
              </button>
            ) : <div />}
          </nav>
        )}
      </main>
    </div>
  );
};
