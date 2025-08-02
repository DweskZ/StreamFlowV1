// src/lib/QueueStorage.ts
import { PlaylistTrack } from '@/types/music';

// Claves específicas por usuario para evitar compartir cola entre cuentas
const getStorageKey = (userId?: string) => `sf_queue_v1_${userId || 'anonymous'}`;
const getStateKey = (userId?: string) => `sf_player_state_v1_${userId || 'anonymous'}`;

interface PlayerState {
  currentIndex: number;
  isRepeatMode: boolean;
  isShuffleMode: boolean;
  currentTrackId?: string;
  // Nuevo campo para controlar reproducción automática
  autoPlayEnabled: boolean;
}

export class QueueStorage {
  static load(userId?: string): PlaylistTrack[] {
    try {
      const storageKey = getStorageKey(userId);
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed: PlaylistTrack[] = JSON.parse(raw);
      return parsed.map(t => ({ ...t, addedAt: new Date(t.addedAt) }));
    } catch {
      return [];
    }
  }

  static save(queue: PlaylistTrack[], userId?: string) {
    try {
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(queue));
    } catch {
      console.error('Error al guardar cola en localStorage');
    }
  }

  static loadState(userId?: string): PlayerState {
    try {
      const stateKey = getStateKey(userId);
      const raw = localStorage.getItem(stateKey);
      if (!raw) return { 
        currentIndex: 0, 
        isRepeatMode: false, 
        isShuffleMode: false,
        autoPlayEnabled: false // Por defecto, no reproducir automáticamente
      };
      const state = JSON.parse(raw);
      // Asegurar compatibilidad con versiones anteriores
      return {
        ...state,
        autoPlayEnabled: state.autoPlayEnabled ?? false
      };
    } catch {
      return { 
        currentIndex: 0, 
        isRepeatMode: false, 
        isShuffleMode: false,
        autoPlayEnabled: false
      };
    }
  }

  static saveState(state: PlayerState, userId?: string) {
    try {
      const stateKey = getStateKey(userId);
      localStorage.setItem(stateKey, JSON.stringify(state));
    } catch {
      console.error('Error al guardar estado en localStorage');
    }
  }

  static clear(userId?: string) {
    try {
      const storageKey = getStorageKey(userId);
      const stateKey = getStateKey(userId);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(stateKey);
    } catch {
      console.error('Error al limpiar localStorage');
    }
  }

  // Limpiar datos de usuarios específicos (útil para logout)
  static clearUserData(userId: string) {
    this.clear(userId);
  }

  // Limpiar datos de usuario anónimo
  static clearAnonymousData() {
    this.clear();
  }

  // Obtener todas las claves de cola para debugging
  static getAllQueueKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sf_queue_v1_')) {
        keys.push(key);
      }
    }
    return keys;
  }

  // Obtener todas las claves de estado para debugging
  static getAllStateKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sf_player_state_v1_')) {
        keys.push(key);
      }
    }
    return keys;
  }
}
