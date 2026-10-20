import React from 'react';
import {
  GUITAR_CHORDS_DB,
  getGuitarChordData,
} from '../utils/musicTheory';

interface ChordDiagramProps {
  chord: string;
  capo?: number;
  className?: string;
  showTitle?: boolean;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chord,
  capo = 0,
  className = '',
  showTitle = true,
}) => {
  const data = getGuitarChordData(chord) || GUITAR_CHORDS_DB[chord];

  if (!data) {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center p-3.5 rounded-2xl bg-black text-white border border-[#222222] shadow-xl min-w-[125px] ${className}`}
      >
        {showTitle && (
          <span className="text-[#EE602B] font-black text-lg tracking-wide text-center">
            {chord}
          </span>
        )}
        <span className="text-[11px] text-[#A1A1AA] mt-1">Acorde</span>
      </div>
    );
  }

  const { frets, fingers = [], baseFret = 1, barre } = data;
  const strings = 6;
  const numFrets = 5; // 5 frets exactly matching reference model

  // Dimensions & positioning matching image_92e61ca6.png
  const width = 124;
  const height = capo > 0 ? 190 : 178;
  const startX = 32;
  const startY = capo > 0 ? 38 : 28;
  const stringSpacing = 14;
  const fretSpacing = 22;

  // Determine P I M A (Polegar, Indicador, Médio, Anelar) fingerstyle symbols
  // 1. Find all active (played) strings
  const activeStrings: number[] = [];
  for (let s = 0; s < strings; s++) {
    if (frets[s] !== -1) {
      activeStrings.push(s);
    }
  }

  const pimaSymbols: (string | null)[] = Array(strings).fill(null);
  if (activeStrings.length > 0) {
    // The lowest active string gets P (Polegar / Thumb)
    const lowest = activeStrings[0];
    pimaSymbols[lowest] = 'P';

    // The treble strings get I, M, A
    const remaining = activeStrings.slice(1);
    if (remaining.length === 3) {
      pimaSymbols[remaining[0]] = 'I';
      pimaSymbols[remaining[1]] = 'M';
      pimaSymbols[remaining[2]] = 'A';
    } else if (remaining.length === 2) {
      pimaSymbols[remaining[0]] = 'I';
      pimaSymbols[remaining[1]] = 'M';
    } else if (remaining.length === 1) {
      pimaSymbols[remaining[0]] = 'I';
    } else if (remaining.length > 3) {
      // 4 or 5 remaining active strings (e.g. open G or open C chords)
      // The 3 highest treble strings get I, M, A
      const len = remaining.length;
      pimaSymbols[remaining[len - 3]] = 'I';
      pimaSymbols[remaining[len - 2]] = 'M';
      pimaSymbols[remaining[len - 1]] = 'A';
    }
  }

  return (
    <div
      className={`inline-flex flex-col items-center p-3 rounded-2xl bg-black text-white border border-[#242424] shadow-2xl select-none min-w-[125px] ${className}`}
    >
      {/* Title: Vibrant Coral Orange (e.g. "D") matching image_92e61ca6.png */}
      {showTitle && (
        <div className="text-[#EE602B] font-black text-lg leading-tight tracking-wide mb-1 text-center font-sans">
          {chord}
        </div>
      )}

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible select-none"
      >
        {/* Top Nut or CAPO Bar */}
        {capo > 0 ? (
          <g>
            {/* Bold white Capo number on the left */}
            <text
              x={startX - 17}
              y={startY - 3}
              fontSize="24"
              fontWeight="900"
              fill="#FFFFFF"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {capo}
            </text>

            {/* White rounded CAPO pill spanning strings 6 to 1 */}
            <rect
              x={startX - 4}
              y={startY - 15}
              width={(strings - 1) * stringSpacing + 8}
              height={15}
              rx={7.5}
              fill="#FFFFFF"
            />

            {/* Black CAPO label centered inside the pill */}
            <text
              x={startX + ((strings - 1) * stringSpacing) / 2}
              y={startY - 4}
              fontSize="8.5"
              fontWeight="900"
              fill="#000000"
              textAnchor="middle"
              fontFamily="sans-serif"
              letterSpacing="2.5"
            >
              CAPO
            </text>
          </g>
        ) : baseFret > 1 ? (
          /* Base fret number on the left when baseFret > 1 and no capo */
          <g>
            <text
              x={startX - 15}
              y={startY + 15}
              fontSize="13"
              fontWeight="900"
              fill="#FFFFFF"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {baseFret}ª
            </text>
            <line
              x1={startX}
              y1={startY}
              x2={startX + (strings - 1) * stringSpacing}
              y2={startY}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </g>
        ) : (
          /* Solid white Nut line when baseFret == 1 and no capo */
          <line
            x1={startX}
            y1={startY}
            x2={startX + (strings - 1) * stringSpacing}
            y2={startY}
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* 5 Horizontal fret lines in crisp white */}
        {Array.from({ length: numFrets + 1 }).map((_, f) => (
          <line
            key={`fret-${f}`}
            x1={startX}
            y1={startY + f * fretSpacing}
            x2={startX + (strings - 1) * stringSpacing}
            y2={startY + f * fretSpacing}
            stroke="#FFFFFF"
            strokeWidth={f === 0 && !capo && baseFret === 1 ? 0 : 1.4}
          />
        ))}

        {/* 6 Vertical string lines (strings 6 to 1) in crisp white */}
        {Array.from({ length: strings }).map((_, s) => (
          <line
            key={`string-${s}`}
            x1={startX + s * stringSpacing}
            y1={startY}
            x2={startX + s * stringSpacing}
            y2={startY + numFrets * fretSpacing}
            stroke="#FFFFFF"
            strokeWidth="1.4"
          />
        ))}

        {/* Barre chord pill if present (e.g. Bm11, F, Bm) */}
        {barre && (
          <rect
            x={startX + barre.toString * stringSpacing - 4}
            y={startY + (barre.fret - (baseFret - 1) - 0.75) * fretSpacing}
            width={(barre.fromString - barre.toString) * stringSpacing + 8}
            height={11}
            rx={5.5}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1.4"
          />
        )}

        {/* Fretted note dots in coral orange (#F26535) with white bold finger numbers */}
        {frets.map((fret, s) => {
          const x = startX + s * stringSpacing;
          const displayFret = fret - (baseFret - 1);
          const finger = fingers[s];

          if (displayFret >= 1 && displayFret <= numFrets) {
            const y = startY + (displayFret - 0.5) * fretSpacing;
            return (
              <g key={`dot-${s}`}>
                <circle cx={x} cy={y} r="7.5" fill="#F26535" />
                {finger > 0 && (
                  <text
                    x={x}
                    y={y + 3.5}
                    fontSize="9.5"
                    fontWeight="900"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}

        {/* Bottom Row: P (Thumb) in Coral Orange circle with white P; I M A in grey circles with dark text */}
        {Array.from({ length: strings }).map((_, s) => {
          const x = startX + s * stringSpacing;
          const botY = startY + numFrets * fretSpacing + 16;
          const symbol = pimaSymbols[s];

          if (symbol === 'P') {
            return (
              <g key={`pima-${s}`}>
                <circle cx={x} cy={botY} r="6.5" fill="#F26535" />
                <text
                  x={x}
                  y={botY + 3.5}
                  fontSize="8.5"
                  fontWeight="900"
                  fill="#FFFFFF"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  P
                </text>
              </g>
            );
          }

          if (symbol) {
            return (
              <g key={`pima-${s}`}>
                <circle cx={x} cy={botY} r="6.5" fill="#9CA3AF" />
                <text
                  x={x}
                  y={botY + 3.5}
                  fontSize="8.5"
                  fontWeight="900"
                  fill="#111827"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {symbol}
                </text>
              </g>
            );
          }

          // Unplayed / muted strings have no circle underneath (completely clean as in image_92e61ca6.png)
          return null;
        })}
      </svg>
    </div>
  );
};
