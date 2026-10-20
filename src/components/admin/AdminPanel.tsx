import React, { useState } from 'react';
import { Song, Artist, Collection } from '../../types/music';
import { storageService } from '../../services/storageService';
import { SongEditorModal } from './SongEditorModal';
import {
  Lock,
  Unlock,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Music,
  Users,
  Shield,
} from 'lucide-react';

interface AdminPanelProps {
  songs: Song[];
  artists: Artist[];
  collections: Collection[];
  onRefreshData: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  songs,
  artists,
  collections,
  onRefreshData,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    storageService.checkAdminAuth()
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin Section tabs
  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'backup'>('songs');

  // Currently editing song modal
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Status message
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storageService.loginAdmin(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Senha incorreta. A senha padrão inicial é "morada123".');
    }
  };

  const handleLogout = () => {
    storageService.logoutAdmin();
    setIsAuthenticated(false);
  };

  const handleSaveSong = (updatedSong: Song) => {
    storageService.saveSong(updatedSong);
    onRefreshData();
    setEditingSong(null);
    showFeedback(`Música "${updatedSong.title}" salva com sucesso!`);
  };

  const handleDeleteSong = (song: Song) => {
    if (window.confirm(`Tem certeza que deseja remover a música "${song.title}"?`)) {
      storageService.deleteSong(song.id);
      onRefreshData();
      showFeedback(`Música "${song.title}" removida.`);
    }
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const sorted = [...songs].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentOrder = sorted[index].order;
    const targetOrder = sorted[targetIndex].order;

    sorted[index].order = targetOrder;
    sorted[targetIndex].order = currentOrder;

    storageService.saveSongs(sorted);
    onRefreshData();
  };

  const handleCreateNewSong = () => {
    const currentArtist = artists[0] || { id: 'art-morada' };
    const currentCollection = collections[0] || { id: 'col-morada-top10' };
    const maxOrder = songs.reduce((max, s) => Math.max(max, s.order), 0);

    const newSong: Song = {
      id: `song-${Date.now()}`,
      artistId: currentArtist.id,
      collectionId: currentCollection.id,
      title: 'Nova Música',
      slug: `nova-musica-${Date.now()}`,
      originalKey: '',
      bpm: null,
      timeSignature: '',
      content: '',
      status: 'published',
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      instrumentsData: {
        violao: {},
        teclado: {},
        baixo: {},
        bateria: {},
      },
    };

    setEditingSong(newSong);
  };

  const handleExportBackup = () => {
    const json = storageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `as-10-mais-tocadas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Backup exportado com sucesso!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.importBackup(content)) {
        onRefreshData();
        showFeedback('Backup importado com sucesso!');
      } else {
        showFeedback('Falha ao importar backup: formato de arquivo JSON inválido.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDefault = () => {
    if (window.confirm('Atenção: Isso restaurará o repertório inicial do Morada (com os 10 títulos cadastrados e campos musicais vazios). Deseja continuar?')) {
      storageService.resetToDefault();
      onRefreshData();
      showFeedback('Repertório restaurado ao estado inicial.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (storageService.changeAdminPassword(oldPassword, newPassword)) {
      setOldPassword('');
      setNewPassword('');
      showFeedback('Senha administrativa alterada com sucesso!');
    } else {
      showFeedback('Senha atual incorreta ou nova senha muito curta (mínimo 4 caracteres).', 'error');
    }
  };

  // If not authenticated, show sleek PIN / Password login card
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141414] border border-[#292929] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao aplicativo</span>
            </button>
            <Lock className="w-4 h-4 text-[#8BB8FF]" />
          </div>

          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1f1f1f] border border-[#292929] flex items-center justify-center text-[#8BB8FF]">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Área Administrativa</h2>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs mx-auto">
              Acesso protegido para cadastro e edição manual das letras, cifras e arranjos das músicas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">
                Senha Administrativa
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha (padrão: morada123)"
                className="w-full bg-[#0c0c0c] border border-[#292929] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8BB8FF]/60 focus:ring-1 focus:ring-[#8BB8FF]/40 font-mono"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#8BB8FF] text-[#080808] font-bold rounded-xl hover:bg-[#a0c6ff] transition-colors text-sm shadow-sm"
            >
              Acessar Painel
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-[#71717A]">
                Senha inicial definida no projeto: <code className="text-[#8BB8FF]">morada123</code>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Sorted songs
  const sortedSongs = [...songs].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-[#080808] text-[#E5E5E5] pb-24">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-[#292929] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Repertório</span>
            </button>
            <span aria-hidden="true" className="text-[#292929]">·</span>
            <span className="text-xs font-semibold text-[#8BB8FF] flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5" />
              Painel do Administrador
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#292929] hover:bg-[#1f1f1f] text-xs text-[#A1A1AA] hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Floating feedback alert */}
      {feedbackMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium border ${
            feedbackMessage.type === 'success'
              ? 'bg-[#141414] text-[#8BB8FF] border-[#8BB8FF]/30'
              : 'bg-red-950 text-red-200 border-red-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#292929] pb-3 mb-6">
          <button
            onClick={() => setActiveTab('songs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'songs'
                ? 'bg-[#141414] text-white border border-[#292929]'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-[#8BB8FF]" />
            <span>Músicas ({songs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'artists'
                ? 'bg-[#141414] text-white border border-[#292929]'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#8BB8FF]" />
            <span>Artistas & Coleções</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'backup'
                ? 'bg-[#141414] text-white border border-[#292929]'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#8BB8FF]" />
            <span>Segurança & Backup</span>
          </button>
        </div>

        {/* TAB 1: SONGS MANAGEMENT */}
        {activeTab === 'songs' && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#141414] border border-[#292929] rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-white">Repertório de Músicas</h3>
                <p className="text-xs text-[#A1A1AA]">
                  Altere títulos, tons originais, ordens e insira as letras e cifras manualmente.
                </p>
              </div>

              <button
                onClick={handleCreateNewSong}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#8BB8FF] text-[#080808] hover:bg-[#a0c6ff] text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Música</span>
              </button>
            </div>

            {/* Song Table / List */}
            <div className="bg-[#141414] border border-[#292929] rounded-xl divide-y divide-[#292929] overflow-hidden">
              {sortedSongs.map((song, index) => {
                const hasChords = song.content && song.content.trim().length > 0;
                return (
                  <div
                    key={song.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#181818] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Order and reorder buttons */}
                      <div className="flex flex-col items-center shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, 'up')}
                          className="p-1 hover:text-white text-[#A1A1AA] disabled:opacity-20"
                          title="Subir ordem"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-[#8BB8FF] px-1">
                          {song.order}
                        </span>
                        <button
                          disabled={index === sortedSongs.length - 1}
                          onClick={() => handleMoveOrder(index, 'down')}
                          className="p-1 hover:text-white text-[#A1A1AA] disabled:opacity-20"
                          title="Descer ordem"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & metadata */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{song.title}</h4>
                          {song.status === 'draft' && (
                            <span className="text-[10px] text-amber-400 font-medium bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                              Rascunho
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA] mt-1">
                          <span>Tom: {song.originalKey || 'Vazio'}</span>
                          <span aria-hidden="true">·</span>
                          {hasChords ? (
                            <span className="text-emerald-400 font-medium">Conteúdo Cadastrado</span>
                          ) : (
                            <span className="text-zinc-500">Conteúdo em preparação</span>
                          )}
                          {song.bpm && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{song.bpm} BPM</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setEditingSong(song)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#262626] border border-[#292929] hover:border-[#8BB8FF]/40 text-xs text-[#E5E5E5] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#8BB8FF]" />
                        <span>Editar Cifras & Letra</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSong(song)}
                        className="p-2 text-[#A1A1AA] hover:text-rose-400 hover:bg-[#1f1f1f] rounded-lg transition-colors"
                        title="Excluir música"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: ARTISTS & COLLECTIONS */}
        {activeTab === 'artists' && (
          <section className="space-y-6">
            <div className="p-4 bg-[#141414] border border-[#292929] rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Artista Principal</h3>
              <p className="text-xs text-[#A1A1AA]">
                Configuração do grupo musical em destaque. Novos artistas e coleções podem ser criados conforme o projeto crescer.
              </p>

              {artists.map((artist) => (
                <div key={artist.id} className="p-4 bg-[#0c0c0c] border border-[#292929] rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#A1A1AA] block mb-1">Nome do Artista / Grupo:</label>
                      <input
                        type="text"
                        value={artist.name}
                        onChange={(e) => {
                          const updated = artists.map((a) =>
                            a.id === artist.id ? { ...a, name: e.target.value } : a
                          );
                          storageService.saveArtists(updated);
                          onRefreshData();
                        }}
                        className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#A1A1AA] block mb-1">Identificador (Slug):</label>
                      <input
                        type="text"
                        value={artist.slug}
                        onChange={(e) => {
                          const updated = artists.map((a) =>
                            a.id === artist.id ? { ...a, slug: e.target.value } : a
                          );
                          storageService.saveArtists(updated);
                          onRefreshData();
                        }}
                        className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Descrição / Biografia:</label>
                    <textarea
                      value={artist.description || ''}
                      onChange={(e) => {
                        const updated = artists.map((a) =>
                          a.id === artist.id ? { ...a, description: e.target.value } : a
                        );
                        storageService.saveArtists(updated);
                        onRefreshData();
                      }}
                      rows={2}
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Collections */}
            <div className="p-4 bg-[#141414] border border-[#292929] rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Coleção Atual</h3>
              {collections.map((col) => (
                <div key={col.id} className="p-4 bg-[#0c0c0c] border border-[#292929] rounded-xl space-y-3">
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Título da Coleção:</label>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => {
                        const updated = collections.map((c) =>
                          c.id === col.id ? { ...c, title: e.target.value } : c
                        );
                        storageService.saveCollections(updated);
                        onRefreshData();
                      }}
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Descrição da Coleção:</label>
                    <textarea
                      value={col.description}
                      onChange={(e) => {
                        const updated = collections.map((c) =>
                          c.id === col.id ? { ...c, description: e.target.value } : c
                        );
                        storageService.saveCollections(updated);
                        onRefreshData();
                      }}
                      rows={2}
                      className="w-full bg-[#141414] border border-[#292929] rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: BACKUP & SECURITY */}
        {activeTab === 'backup' && (
          <section className="space-y-6">
            {/* Backup & Restore */}
            <div className="p-4 bg-[#141414] border border-[#292929] rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Backup & Importação Estruturada</h3>
              <p className="text-xs text-[#A1A1AA]">
                Exporte todo o seu acervo de letras, cifras e arranjos em formato JSON seguro para backup ou migração para outros dispositivos.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1f1f1f] hover:bg-[#262626] border border-[#292929] text-xs font-semibold text-white transition-colors"
                >
                  <Download className="w-4 h-4 text-[#8BB8FF]" />
                  <span>Exportar Backup Completo (JSON)</span>
                </button>

                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1f1f1f] hover:bg-[#262626] border border-[#292929] text-xs font-semibold text-white cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#8BB8FF]" />
                  <span>Restaurar Backup de Arquivo</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Change Password */}
            <div className="p-4 bg-[#141414] border border-[#292929] rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#8BB8FF]" />
                <span>Alterar Senha do Administrador</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1">Senha Atual:</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white font-mono"
                    placeholder="Digite a senha atual"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1">Nova Senha:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-[#292929] rounded-lg px-3 py-2 text-xs text-white font-mono"
                    placeholder="Mínimo 4 caracteres"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#8BB8FF] text-[#080808] font-semibold text-xs hover:bg-[#a0c6ff] transition-colors"
                >
                  Atualizar Senha
                </button>
              </form>
            </div>

            {/* Danger Zone: Reset to Initial State */}
            <div className="p-4 bg-[#141414] border border-rose-900/30 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-rose-400">Restaurar Repertório Inicial</h3>
              <p className="text-xs text-[#A1A1AA]">
                Restaura o repertório oficial com as 10 músicas do Morada listadas no projeto, zerando modificações não exportadas.
              </p>

              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 text-xs font-semibold text-rose-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão do Projeto</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Song Editor Modal */}
      {editingSong && (
        <SongEditorModal
          song={editingSong}
          onSave={handleSaveSong}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
};
