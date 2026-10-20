import { Artist, Collection, Song } from '../types/music';
import { INITIAL_ARTIST, INITIAL_COLLECTION, INITIAL_SONGS } from '../data/initialData';

const STORAGE_KEYS = {
  ARTISTS: 'as10_artists_v1',
  COLLECTIONS: 'as10_collections_v1',
  SONGS: 'as10_songs_v1',
  FAVORITES: 'as10_favorites_v1',
  ADMIN_AUTH: 'as10_admin_auth_v1',
  ADMIN_HASH: 'as10_admin_hash_v1',
};

// Default admin PIN / password is "morada123" (simple, memorable for worship teams)
const DEFAULT_ADMIN_PASS = 'morada123';

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // ARTISTS
  getArtists(): Artist[] {
    if (!this.isBrowser()) return [INITIAL_ARTIST];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARTISTS);
      return data ? JSON.parse(data) : [INITIAL_ARTIST];
    } catch {
      return [INITIAL_ARTIST];
    }
  }

  saveArtists(artists: Artist[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(artists));
  }

  // COLLECTIONS
  getCollections(): Collection[] {
    if (!this.isBrowser()) return [INITIAL_COLLECTION];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      return data ? JSON.parse(data) : [INITIAL_COLLECTION];
    } catch {
      return [INITIAL_COLLECTION];
    }
  }

  saveCollections(collections: Collection[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  }

  // SONGS
  getSongs(): Song[] {
    if (!this.isBrowser()) return INITIAL_SONGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SONGS);
      if (!data) {
        // Initialize with predefined 10 Morada songs
        this.saveSongs(INITIAL_SONGS);
        return INITIAL_SONGS;
      }
      const parsed: Song[] = JSON.parse(data);
      let hasUpdates = false;
      for (const initSong of INITIAL_SONGS) {
        const existing = parsed.find((s) => s.id === initSong.id);
        if (existing && !existing.content && initSong.content) {
          existing.content = initSong.content;
          existing.originalKey = initSong.originalKey;
          existing.bpm = initSong.bpm;
          existing.timeSignature = initSong.timeSignature;
          existing.capo = initSong.capo;
          existing.structure = initSong.structure;
          existing.observations = initSong.observations;
          existing.instrumentsData = initSong.instrumentsData;
          hasUpdates = true;
        }
      }
      if (hasUpdates) {
        this.saveSongs(parsed);
      }
      return parsed;
    } catch {
      return INITIAL_SONGS;
    }
  }

  getSongById(id: string): Song | undefined {
    const songs = this.getSongs();
    return songs.find((s) => s.id === id);
  }

  saveSongs(songs: Song[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
  }

  saveSong(song: Song): void {
    const songs = this.getSongs();
    const index = songs.findIndex((s) => s.id === song.id);
    const updated = {
      ...song,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      songs[index] = updated;
    } else {
      songs.push(updated);
    }
    this.saveSongs(songs);
  }

  deleteSong(id: string): void {
    const songs = this.getSongs().filter((s) => s.id !== id);
    this.saveSongs(songs);
  }

  // FAVORITES
  getFavorites(): string[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleFavorite(songId: string): boolean {
    if (!this.isBrowser()) return false;
    const favs = this.getFavorites();
    const index = favs.indexOf(songId);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push(songId);
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return isFav;
  }

  isFavorite(songId: string): boolean {
    return this.getFavorites().includes(songId);
  }

  // ADMIN AUTHENTICATION
  checkAdminAuth(): boolean {
    if (!this.isBrowser()) return false;
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  loginAdmin(password: string): boolean {
    if (!this.isBrowser()) return false;
    const currentPass = localStorage.getItem(STORAGE_KEYS.ADMIN_HASH) || DEFAULT_ADMIN_PASS;
    if (password === currentPass) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  }

  logoutAdmin(): void {
    if (!this.isBrowser()) return;
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  changeAdminPassword(oldPass: string, newPass: string): boolean {
    if (!this.loginAdmin(oldPass)) return false;
    if (!newPass || newPass.trim().length < 4) return false;
    localStorage.setItem(STORAGE_KEYS.ADMIN_HASH, newPass.trim());
    return true;
  }

  // BACKUP & RESTORE
  exportBackup(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      artists: this.getArtists(),
      collections: this.getCollections(),
      songs: this.getSongs(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.songs)) {
        this.saveSongs(parsed.songs);
        if (Array.isArray(parsed.artists)) this.saveArtists(parsed.artists);
        if (Array.isArray(parsed.collections)) this.saveCollections(parsed.collections);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  resetToDefault(): void {
    if (!this.isBrowser()) return;
    this.saveArtists([INITIAL_ARTIST]);
    this.saveCollections([INITIAL_COLLECTION]);
    this.saveSongs(INITIAL_SONGS);
  }
}

export const storageService = new StorageService();
