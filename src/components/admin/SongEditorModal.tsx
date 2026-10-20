import React, { useState } from 'react';
import { Song, InstrumentDetails } from '../../types/music';
import { convertTraditionalToBracket, extractUniqueChords, parseSongContent } from '../../utils/chordParser';
import { SongChordViewer } from '../SongChordViewer';
import { ChordDiagram } from '../ChordDiagram';
import { CONCEPT_DEMO_TEMPLATE } from '../../data/initialData';
import { Eye, Edit3, X, Sparkles, HelpCircle } from 'lucide-react';

interface SongEditorModalProps {
  song: Song;
  onSave: (updatedSong: Song) => void;
  onClose: () => void;
}

export const SongEditorModal: React.FC<SongEditorModalProps> = ({
  song,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'instruments' | 'meta'>('content');
  const [showPreview, setShowPreview] = useState(false);

  // Form states
  const [title, setTitle] = useState(song.title);
  const [originalKey, setOriginalKey] = useState(song.originalKey || '');
  const [bpm, setBpm] = useState<string>(song.bpm ? String(song.bpm) : '');
  const [timeSignature, setTimeSignature] = useState(song.timeSignature || '');
  const [capo, setCapo] = useState<string>(song.capo !== undefined && song.capo !== null ? String(song.capo) : '');
  const [status, setStatus] = useState<'draft' | 'published'>(song.status);
  const [order, setOrder] = useState<number>(song.order);
  const [observations, setObservations] = useState(song.observations || '');
  const [structure, setStructure] = useState(song.structure || '');
  const [content, setContent] = useState(song.content || '');

  // Instruments data
  const [violao, setViolao] = useState<InstrumentDetails>(song.instrumentsData?.violao || {});
  const [teclado, setTeclado] = useState<InstrumentDetails>(song.instrumentsData?.teclado || {});
  const [baixo, setBaixo] = useState<InstrumentDetails>(song.instrumentsData?.baixo || {});
  const [bateria, setBateria] = useState<InstrumentDetails>(song.instrumentsData?.bateria || {});

  // Quick insertion of section tags
  const insertTag = (tag: string) => {
    setContent((prev) => (prev ? `${prev}\n\n[${tag}]\n` : `[${tag}]\n`));
  };

  // Convert traditional 2-line format
  const handleConvertTraditional = () => {
    if (!content.trim()) return;
    const converted = convertTraditionalToBracket(content);
    setContent(converted);
  };

  // Load conceptual demo template
  const handleLoadConceptDemo = () => {
    if (window.confirm('Deseja carregar o modelo conceitual de demonstração (G, D/F#, Em7)? Isso substituirá o conteúdo atual do editor.')) {
      setOriginalKey(CONCEPT_DEMO_TEMPLATE.originalKey);
      setBpm(String(CONCEPT_DEMO_TEMPLATE.bpm));
      setTimeSignature(CONCEPT_DEMO_TEMPLATE.timeSignature);
      setStructure(CONCEPT_DEMO_TEMPLATE.structure);
      setObservations(CONCEPT_DEMO_TEMPLATE.observations);
      setContent(CONCEPT_DEMO_TEMPLATE.content);
      setViolao(CONCEPT_DEMO_TEMPLATE.instrumentsData.violao);
      setTeclado(CONCEPT_DEMO_TEMPLATE.instrumentsData.teclado);
      setBaixo(CONCEPT_DEMO_TEMPLATE.instrumentsData.baixo);
      setBateria(CONCEPT_DEMO_TEMPLATE.instrumentsData.bateria);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor informe o título da música.');
      return;
    }

    const updated: Song = {
      ...song,
      title: title.trim(),
      originalKey: originalKey.trim().toUpperCase(),
      bpm: bpm ? parseInt(bpm, 10) : null,
      timeSignature: timeSignature.trim() || null,
      capo: capo ? parseInt(capo, 10) : null,
      status,
      order: Number(order) || 1,
      observations: observations.trim(),
      structure: structure.trim(),
      content: content.trim(),
      instrumentsData: {
        violao,
        teclado,
        baixo,
        bateria,
      },
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
  };

  const previewSong: Song = {
    ...song,
    title,
    originalKey,
    content,
    bpm: bpm ? parseInt(bpm, 10) : null,
    timeSignature,
    observations,
    instrumentsData: { violao, teclado, baixo, bateria },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141414] border border-[#292929] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292929]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Editar Música: {title || 'Sem Título'}</span>
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Preencha os campos musicais, letras e cifras manualmente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showPreview
                  ? 'bg-[#8BB8FF] text-[#080808] border-[#8BB8FF] font-bold'
                  : 'bg-[#1f1f1f] text-[#E5E5E5] border-[#292929] hover:border-[#8BB8FF]/40'
              }`}
            >
              {showPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPreview ? 'Voltar ao Editor' : 'Prévia'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {showPreview ? (
          <div className="p-6 overflow-y-auto flex-1 bg-[#080808]">
            <div className="max-w-2xl mx-auto">
              <div className="mb-4 pb-2 border-b border-[#292929]">
                <h3 className="text-xl font-bold text-white">{previewSong.title}</h3>
                <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mt-1">
                  <span>Tom: {previewSong.originalKey || 'Não definido'}</span>
                  {previewSong.bpm && <span>· {previewSong.bpm} BPM</span>}
                  {previewSong.timeSignature && <span>· Compasso: {previewSong.timeSignature}</span>}
                  {previewSong.capo && <span>· Capotraste: {previewSong.capo}ª casa</span>}
                </div>
              </div>

              {/* Chord diagrams row in preview */}
              {(() => {
                const uniqueChords = extractUniqueChords(parseSongContent(previewSong.content));
                if (uniqueChords.length === 0) return null;
                return (
                  <div className="mb-6 p-4 rounded-2xl bg-[#101010] border border-[#292929]">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-white">
                        Acordes ({uniqueChords.length})
                      </span>
                      {previewSong.capo ? (
                        <span className="text-[#EE602B] font-bold text-[11px]">
                          Capotraste: {previewSong.capo}ª casa
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
                      {uniqueChords.map((c, idx) => (
                        <ChordDiagram
                          key={`prev-${c}-${idx}`}
                          chord={c}
                          capo={previewSong.capo || 0}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              <SongChordViewer
                song={previewSong}
                semitoneOffset={0}
                notation="anglo"
                fontSize={18}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#292929] pb-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'content'
                    ? 'bg-[#1f1f1f] text-white border border-[#292929]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                1. Letra e Cifras
              </button>
              <button
                onClick={() => setActiveTab('instruments')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'instruments'
                    ? 'bg-[#1f1f1f] text-white border border-[#292929]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                2. Instrumentos (4)
              </button>
              <button
                onClick={() => setActiveTab('meta')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'meta'
                    ? 'bg-[#1f1f1f] text-white border border-[#292929]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                3. Dados Gerais & Tom
              </button>
            </div>

            {/* TAB 1: CONTENT (LYRICS & CHORDS) */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[#A1A1AA]">Inserir Seção:</span>
                    {['Introdução', 'Verso', 'Pré-Refrão', 'Refrão', 'Ponte', 'Instrumental', 'Final'].map(
                      (sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => insertTag(sec)}
                          className="px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#292929] text-[#E5E5E5] hover:border-[#8BB8FF]/50 text-[11px]"
                        >
                          +{sec}
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConvertTraditional}
                      className="px-2.5 py-1 rounded bg-[#1f1f1f] border border-[#292929] hover:border-[#8BB8FF]/50 text-xs text-[#8BB8FF] transition-colors"
                      title="Transforma texto com linhas de acordes acima da letra em formato sincronizado [Acorde]Letra"
                    >
                      Converter 2 Linhas → Integrado
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadConceptDemo}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1f1f1f] border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs transition-colors"
                      title="Carrega o exemplo conceitual do Morada (G, D/F#, Em7) para testes"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Exemplo Conceitual</span>
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={14}
                    placeholder={`Cole aqui as letras e cifras.\n\nFormato 1 (Recomendado):\n[G]É tudo sobre [D/F#]você\n[Em7]Jesus, tudo é sobre Você\n\nFormato 2 (Tradicional):\nG          D/F#     Em7\nÉ tudo sobre você, Jesus\n(depois clique em "Converter 2 Linhas → Integrado")`}
                    className="w-full bg-[#0c0c0c] border border-[#292929] rounded-xl p-4 font-mono text-sm text-[#E5E5E5] placeholder-[#52525B] focus:outline-none focus:border-[#8BB8FF]/60 focus:ring-1 focus:ring-[#8BB8FF]/40 leading-relaxed"
                  />
                </div>

                <div className="p-3 bg-[#0c0c0c] border border-[#292929] rounded-lg text-xs text-[#A1A1AA] flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#8BB8FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-medium">Como funciona o alinhamento:</span> Coloque o acorde entre colchetes exatamente antes da sílaba correspondente, por exemplo: <code className="text-[#8BB8FF] font-mono">[G]Tudo [D/F#]sobre</code>. Isso garante que o acorde fique perfeitamente travado sobre a palavra em qualquer tamanho de tela e fonte.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INSTRUMENTS (4 INSTRUMENTS) */}
            {activeTab === 'instruments' && (
              <div className="space-y-6">
                {/* Violão */}
                <div className="p-4 bg-[#0c0c0c] border border-[#292929] rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8BB8FF]">
                    Violão
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#A1A1AA] block mb-1">Capotraste (casa):</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={capo}
                        onChange={(e) => {
                          setCapo(e.target.value);
                          setViolao({ ...violao, capo: e.target.value ? parseInt(e.target.value, 10) : 0 });
                        }}
                        placeholder="Ex: 2 (para 2ª casa) ou 0"
                        className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#A1A1AA] block mb-1">Afinação:</label>
                      <input
                        type="text"
                        value={violao.tuning || ''}
                        onChange={(e) => setViolao({ ...violao, tuning: e.target.value })}
                        placeholder="Ex: Padrão (E A D G B E) ou Meio tom abaixo"
                        className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Orientações de Execução (dedilhado, levada):</label>
                    <textarea
                      value={violao.notes || ''}
                      onChange={(e) => setViolao({ ...violao, notes: e.target.value })}
                      rows={2}
                      placeholder="Ex: Dedilhado suave na intro, levada com palheta a partir do refrão."
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Teclado */}
                <div className="p-4 bg-[#0c0c0c] border border-[#292929] rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8BB8FF]">
                    Teclado
                  </h4>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Timbre / Patch Sugerido:</label>
                    <input
                      type="text"
                      value={teclado.synthPatch || ''}
                      onChange={(e) => setTeclado({ ...teclado, synthPatch: e.target.value })}
                      placeholder="Ex: Piano Acústico + Warm Pad"
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Notas dos Acordes e Aberturas (Voicings):</label>
                    <input
                      type="text"
                      value={teclado.keyNotes || ''}
                      onChange={(e) => setTeclado({ ...teclado, keyNotes: e.target.value })}
                      placeholder="Ex: G: Sol-Si-Ré | D/F#: Fá#-Ré-Lá"
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Orientações de Execução:</label>
                    <textarea
                      value={teclado.notes || ''}
                      onChange={(e) => setTeclado({ ...teclado, notes: e.target.value })}
                      rows={2}
                      placeholder="Orientações específicas para o tecladista."
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Baixo */}
                <div className="p-4 bg-[#0c0c0c] border border-[#292929] rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8BB8FF]">
                    Baixo
                  </h4>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Linhas de Baixo / Tablatura / Progressão de Fundamentais:</label>
                    <textarea
                      value={baixo.bassLineNotes || ''}
                      onChange={(e) => setBaixo({ ...baixo, bassLineNotes: e.target.value })}
                      rows={2}
                      placeholder="Ex: G -> F# -> E -> C (marcar a descida no F# no tempo 1)"
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Orientações de Execução:</label>
                    <textarea
                      value={baixo.notes || ''}
                      onChange={(e) => setBaixo({ ...baixo, notes: e.target.value })}
                      rows={2}
                      placeholder="Orientações específicas para o contrabaixo."
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Bateria */}
                <div className="p-4 bg-[#0c0c0c] border border-[#292929] rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8BB8FF]">
                    Bateria
                  </h4>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Sensação / Groove / Andamento:</label>
                    <input
                      type="text"
                      value={bateria.tempoFeel || ''}
                      onChange={(e) => setBateria({ ...bateria, tempoFeel: e.target.value })}
                      placeholder="Ex: Ballad Worship 68 BPM - prato de condução com bumbo solto"
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Viradas, Paradas & Dinâmica:</label>
                    <textarea
                      value={bateria.cues || ''}
                      onChange={(e) => setBateria({ ...bateria, cues: e.target.value })}
                      rows={2}
                      placeholder="Ex: Pausa no compasso 4 do refrão; virada forte nos tons antes da ponte."
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Mapa de Seções / Dinâmica:</label>
                    <textarea
                      value={bateria.sectionsOutline || ''}
                      onChange={(e) => setBateria({ ...bateria, sectionsOutline: e.target.value })}
                      rows={2}
                      placeholder="Ex: Intro (só chimbal) -> V1 (bumbo 1 e 3) -> Refrão (condução aberta)"
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GENERAL DATA */}
            {activeTab === 'meta' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Título da Música: *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-sm text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Tom Original:</label>
                    <input
                      type="text"
                      value={originalKey}
                      onChange={(e) => setOriginalKey(e.target.value)}
                      placeholder="Ex: G, D, Em, Bb"
                      className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-sm text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Andamento (BPM):</label>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      placeholder="Ex: 68 ou 120"
                      className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Compasso:</label>
                    <input
                      type="text"
                      value={timeSignature}
                      onChange={(e) => setTimeSignature(e.target.value)}
                      placeholder="Ex: 4/4, 6/8, 3/4"
                      className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Ordem na Coleção:</label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Status de Publicação:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                      className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="published">Publicado</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1">Estrutura da Música (Roadmap):</label>
                  <input
                    type="text"
                    value={structure}
                    onChange={(e) => setStructure(e.target.value)}
                    placeholder="Ex: Intro > Verso 1 > Refrão > Verso 2 > Refrão > Ponte > Final"
                    className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1">Observações Gerais:</label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                    placeholder="Observações ministeriais, dinâmica do louvor, arranjos vocais..."
                    className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg p-3 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#292929] bg-[#0f0f0f] flex items-center justify-between gap-3">
          <div className="text-xs text-[#A1A1AA]">
            {content ? `${content.split('\n').length} linhas cadastradas` : 'Sem conteúdo musical'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#8BB8FF] text-[#080808] hover:bg-[#a0c6ff] transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
