// src/lib/QueueStorage.ts
import { PlaylistTrack } from '@/types/music';

const STORAGE_KEY = 'sf_queue_v1';

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
      console.error('Error al guardar en localStorage');
    }
  }
}
