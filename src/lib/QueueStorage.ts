// src/lib/QueueStorage.ts
import { PlaylistTrack } from '@/types/music';

const STORAGE_KEY = 'sf_queue_v1';
const STATE_KEY = 'sf_player_state_v1';

interface PlayerState {
  currentIndex: number;
  isRepeatMode: boolean;
  isShuffleMode: boolean;
  currentTrackId?: string;
}

export class QueueStorage {
  static load(): PlaylistTrack[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: PlaylistTrack[] = JSON.parse(raw);
      return parsed.map(t => ({ ...t, addedAt: new Date(t.addedAt) }));
    } catch {
      return [];
    }
  }

  static save(queue: PlaylistTrack[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
      console.error('Error al guardar cola en localStorage');
    }
  }

  static loadState(): PlayerState {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return { currentIndex: 0, isRepeatMode: false, isShuffleMode: false };
      return JSON.parse(raw);
    } catch {
      return { currentIndex: 0, isRepeatMode: false, isShuffleMode: false };
    }
  }

  static saveState(state: PlayerState) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      console.error('Error al guardar estado en localStorage');
    }
  }

  static clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STATE_KEY);
    } catch {
      console.error('Error al limpiar localStorage');
    }
  }
}
