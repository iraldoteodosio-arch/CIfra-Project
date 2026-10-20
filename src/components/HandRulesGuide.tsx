import React from 'react';
import { X, Hand, Info } from 'lucide-react';

interface HandRulesGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const HandRulesGuide: React.FC<HandRulesGuideProps> = ({
  isOpen = true,
  onClose,
  isModal = false,
}) => {
  if (isModal && !isOpen) return null;

  const content = (
    <div className="bg-[#101010] border border-[#292929] rounded-2xl p-5 md:p-6 text-white shadow-2xl max-w-2xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#242424]">
        <div className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-[#EE602B]" />
          <h3 className="text-base md:text-lg font-black tracking-wide text-[#EE602B] uppercase">
            Lembre-se: Regra das Mãos no Violão
          </h3>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[#A1A1AA] hover:text-white rounded-lg transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Visual illustration container */}
      <div className="mb-5 rounded-xl overflow-hidden bg-white/95 p-3 flex flex-col items-center justify-center border border-slate-700/30">
        <img
          src="/assets/aistudio/image_b5a9d7ee.png"
          alt="Regra da Mão Esquerda e Mão Direita"
          className="max-h-64 object-contain mx-auto"
        />
      </div>

      {/* Two columns explaining the rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left hand */}
        <div className="p-4 rounded-xl bg-[#161616] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <h4 className="text-sm font-black uppercase text-white tracking-wide">
              Mão Esquerda
            </h4>
          </div>
          <p className="text-xs text-[#EE602B] font-bold uppercase mb-3">
            Executa a formação dos acordes
          </p>

          <div className="space-y-1.5 text-xs text-[#D4D4D8]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                1
              </span>
              <span><strong>Dedo 1:</strong> Indicador</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                2
              </span>
              <span><strong>Dedo 2:</strong> Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                3
              </span>
              <span><strong>Dedo 3:</strong> Anelar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                4
              </span>
              <span><strong>Dedo 4:</strong> Mínimo</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] pt-1">
              * O polegar fica posicionado atrás do braço como ponto de apoio.
            </p>
          </div>
        </div>

        {/* Right hand */}
        <div className="p-4 rounded-xl bg-[#161616] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <h4 className="text-sm font-black uppercase text-white tracking-wide">
              Mão Direita
            </h4>
          </div>
          <p className="text-xs text-[#EE602B] font-bold uppercase mb-3">
            Executa as batidas e os dedilhados
          </p>

          <div className="space-y-1.5 text-xs text-[#D4D4D8]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                P
              </span>
              <span><strong>P:</strong> Polegar (toca os baixos / bordões)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                I
              </span>
              <span><strong>I:</strong> Indicador (dedilha cordas agudas)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                M
              </span>
              <span><strong>M:</strong> Médio (dedilha cordas agudas)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">
                A
              </span>
              <span><strong>A:</strong> Anelar (dedilha a 1ª corda / primas)</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] pt-1">
              * Utilizado em todas as canções para conduzir ritmo e dedilhado.
            </p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-[#242424] flex items-center gap-2 text-xs text-[#A1A1AA]">
        <Info className="w-4 h-4 text-[#8BB8FF] shrink-0" />
        <span>
          Esta convenção é adotada em todos os diagramas de acordes de todas as músicas do repertório.
        </span>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{content}</div>
    </div>
  );
};
