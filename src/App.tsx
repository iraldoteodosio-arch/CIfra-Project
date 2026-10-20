import React, { useState, useEffect, useMemo } from 'react';
import { Song, Artist, Collection } from './types/music';
import { storageService } from './services/storageService';
import { SongView } from './components/SongView';
import { AdminPanel } from './components/admin/AdminPanel';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import {
  Search,
  Heart,
  Music,
  Sliders,
  ChevronRight,
  Disc,
  Settings,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Navigation state
  const [activeView, setActiveView] = useState<'home' | 'song' | 'admin'>('home');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'ready' | 'pending' | 'favorites'>('all');

  // Load initial data
  const loadData = () => {
    setArtists(storageService.getArtists());
    setCollections(storageService.getCollections());
    setSongs(storageService.getSongs());
    setFavorites(storageService.getFavorites());
  };

  useEffect(() => {
    loadData();

    // Register service worker for offline support
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  const handleToggleFavorite = (songId: string) => {
    storageService.toggleFavorite(songId);
    setFavorites(storageService.getFavorites());
  };

  const handleSelectSong = (songId: string) => {
    setSelectedSongId(songId);
    setActiveView('song');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered song list
  const filteredSongs = useMemo(() => {
    let result = [...songs].sort((a, b) => a.order - b.order);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.originalKey && s.originalKey.toLowerCase().includes(q))
      );
    }

    if (filterMode === 'ready') {
      result = result.filter((s) => s.content && s.content.trim().length > 0);
    } else if (filterMode === 'pending') {
      result = result.filter((s) => !s.content || s.content.trim().length === 0);
    } else if (filterMode === 'favorites') {
      result = result.filter((s) => favorites.includes(s.id));
    }

    return result;
  }, [songs, searchQuery, filterMode, favorites]);

  const activeSong = songs.find((s) => s.id === selectedSongId);
  const activeArtist = artists[0] || { name: 'Morada' };
  const activeCollection = collections[0] || { title: 'As 10 Mais Tocadas do Morada' };

  // Route: Song detail view
  if (activeView === 'song' && activeSong) {
    return (
      <SongView
        song={activeSong}
        allSongs={songs.sort((a, b) => a.order - b.order)}
        isFavorite={favorites.includes(activeSong.id)}
        onToggleFavorite={handleToggleFavorite}
        onSelectSong={handleSelectSong}
        onBack={() => setActiveView('home')}
      />
    );
  }

  // Route: Administrative panel
  if (activeView === 'admin') {
    return (
      <AdminPanel
        songs={songs}
        artists={artists}
        collections={collections}
        onRefreshData={loadData}
        onClose={() => setActiveView('home')}
      />
    );
  }

  // Route: Home / Collection list view
  return (
    <div className="min-h-screen bg-[#080808] text-[#E5E5E5] flex flex-col">
      {/* Top Bar Contract (Wordmark - Clean Links - Primary Action) */}
      <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-[#292929] px-4 md:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#292929] flex items-center justify-center text-[#8BB8FF]">
              <Disc className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                As 10 Mais Tocadas
              </span>
              <span className="hidden sm:inline text-xs text-[#A1A1AA] ml-2">
                · Morada
              </span>
            </div>
          </div>

          {/* Zone 2 & 3: Actions (PWA install & Admin Access) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />

            <button
              onClick={() => setActiveView('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#292929] hover:border-[#8BB8FF]/40 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
              title="Área Administrativa para cadastrar cifras e letras"
            >
              <Settings className="w-3.5 h-3.5 text-[#8BB8FF]" />
              <span className="hidden sm:inline">Administração</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Collection Hero / Banner */}
        <section className="mb-8 p-6 md:p-8 bg-[#141414] border border-[#292929] rounded-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#8BB8FF] font-semibold uppercase tracking-wider mb-2">
              <span>Coleção Oficial Top 10</span>
              <span aria-hidden="true" className="text-[#A1A1AA]">·</span>
              <span className="text-[#A1A1AA]">Gospel & Adoração</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              {activeArtist.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
              {activeCollection.description ||
                'Biblioteca completa com letras, cifras sincronizadas e orientações específicas para violão, teclado, baixo e bateria.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A1A1AA] pt-4 border-t border-[#292929]">
              <div className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#8BB8FF]" />
                <span className="font-semibold text-white">{songs.length}</span>
                <span>músicas</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#8BB8FF]" />
                <span>Transposição em tempo real</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium">4 instrumentos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar música por título ou tom..."
                className="w-full bg-[#141414] border border-[#292929] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#8BB8FF]/60 focus:ring-1 focus:ring-[#8BB8FF]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#141414] border border-[#292929] rounded-xl overflow-x-auto text-xs shrink-0">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  filterMode === 'all'
                    ? 'bg-[#1f1f1f] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Todas ({songs.length})
              </button>

              <button
                onClick={() => setFilterMode('ready')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  filterMode === 'ready'
                    ? 'bg-[#1f1f1f] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Com Cifra ({songs.filter((s) => s.content && s.content.trim().length > 0).length})
              </button>

              <button
                onClick={() => setFilterMode('pending')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  filterMode === 'pending'
                    ? 'bg-[#1f1f1f] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Em Preparação ({songs.filter((s) => !s.content || s.content.trim().length === 0).length})
              </button>

              <button
                onClick={() => setFilterMode('favorites')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  filterMode === 'favorites'
                    ? 'bg-[#1f1f1f] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Heart className={`w-3 h-3 ${favorites.length > 0 ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>Favoritas ({favorites.length})</span>
              </button>
            </div>
          </div>
        </section>

        {/* Songs List */}
        <section className="space-y-2.5">
          {filteredSongs.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#292929] rounded-2xl bg-[#0e0e0e] p-6">
              <p className="text-sm text-[#A1A1AA] mb-2">Nenhuma música encontrada com os filtros selecionados.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#8BB8FF] hover:underline"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            filteredSongs.map((song) => {
              const hasContent = Boolean(song.content && song.content.trim().length > 0);
              const isFav = favorites.includes(song.id);

              return (
                <div
                  key={song.id}
                  onClick={() => handleSelectSong(song.id)}
                  className="group p-4 bg-[#141414] hover:bg-[#181818] border border-[#292929] hover:border-[#8BB8FF]/30 rounded-xl flex items-center justify-between gap-4 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Track Number */}
                    <span className="w-7 text-center font-mono text-xs font-bold text-[#A1A1AA] group-hover:text-[#8BB8FF] shrink-0">
                      {String(song.order).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-[#8BB8FF] transition-colors truncate">
                          {song.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA] mt-0.5">
                        {song.originalKey ? (
                          <span className="font-mono text-[#8BB8FF]">Tom {song.originalKey}</span>
                        ) : (
                          <span>Tom a definir</span>
                        )}

                        <span aria-hidden="true">·</span>

                        {hasContent ? (
                          <span className="text-emerald-400 text-[11px]">Cifra disponível</span>
                        ) : (
                          <span className="text-[#71717A] text-[11px]">Conteúdo em preparação</span>
                        )}

                        {song.bpm ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[11px]">{song.bpm} BPM</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Favorite button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(song.id);
                      }}
                      className={`p-2 rounded-lg border border-[#292929] transition-colors ${
                        isFav
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-[#181818] text-[#71717A] hover:text-white'
                      }`}
                      title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                    </button>

                    <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Informative Guidance & Footer Note */}
        <section className="mt-12 pt-6 border-t border-[#292929] text-center text-xs text-[#A1A1AA]">
          <div className="flex items-center justify-center gap-1.5 mb-2 text-[#8BB8FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">Modo Ensaio e Palco</span>
          </div>
          <p className="max-w-md mx-auto text-[#71717A] text-[11px] leading-relaxed">
            Abra qualquer música para visualizar cifras sincronizadas, transpor o tom, selecionar visualização para violão, teclado, baixo ou bateria, e usar a tela cheia.
          </p>
        </section>
      </main>

      {/* Offline Toast */}
      <OfflineIndicator />
    </div>
  );
}
