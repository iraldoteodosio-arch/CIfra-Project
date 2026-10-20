import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { Download, Share, X, WifiOff } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8BB8FF]/10 hover:bg-[#8BB8FF]/20 border border-[#8BB8FF]/30 text-xs font-semibold text-[#8BB8FF] transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] border border-[#292929] hover:border-[#8BB8FF]/40 text-xs font-medium text-[#E5E5E5] transition-colors"
        >
          <Share className="w-3.5 h-3.5 text-[#8BB8FF]" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-[#141414] border border-[#292929] p-6 shadow-2xl text-left">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Instalar no iOS (iPhone / iPad)</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-[#A1A1AA] hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#A1A1AA] mt-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1f1f1f] text-white font-mono shrink-0">1</span>
                  <span>Toque no botão <strong>Compartilhar</strong> (ícone com seta para cima) na barra do Safari.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1f1f1f] text-white font-mono shrink-0">2</span>
                  <span>Role a lista para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1f1f1f] text-white font-mono shrink-0">3</span>
                  <span>Toque em <strong>Adicionar</strong> no canto superior direito para acessar offline!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 rounded-xl bg-[#8BB8FF] text-[#080808] font-bold text-xs hover:bg-[#a0c6ff] transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#141414] border border-amber-500/40 px-3.5 py-2 text-xs font-medium text-amber-300 shadow-2xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Modo Offline — Acessando dados locais salvos.</span>
    </div>
  );
};
