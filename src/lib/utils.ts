import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funciones de aleatoriedad segura
export const secureRandom = {
  // Generar un número entero aleatorio entre min y max (inclusive)
  int: (min: number, max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % (max - min + 1));
  },

  // Generar un número decimal aleatorio entre 0 y 1
  float: (): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  },

  // Mezclar un array de forma segura (Fisher-Yates shuffle)
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = secureRandom.int(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Seleccionar un elemento aleatorio de un array
  choice: <T>(array: T[]): T => {
    if (array.length === 0) throw new Error('Array cannot be empty');
    return array[secureRandom.int(0, array.length - 1)];
  }
};

/**
 * Limpia el localStorage de datos que han sido migrados a Supabase
 * Esta función debe ejecutarse después de confirmar que la migración fue exitosa
 */
export const cleanupLocalStorage = () => {
  try {
    // Claves que ya no se usan porque los datos están en Supabase
    const keysToRemove = [
      'sf_liked_songs',      // Favoritos migrados a user_favorites
      'sf_playlists',        // Playlists migradas a user_playlists
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Limpiado localStorage: ${key}`);
    });

    console.log('✅ Limpieza de localStorage completada');
  } catch (error) {
    console.error('❌ Error limpiando localStorage:', error);
  }
};

/**
 * Verifica si hay datos en localStorage que necesitan ser migrados
 */
export const checkLocalStorageData = () => {
  const keysToCheck = [
    'sf_liked_songs',
    'sf_playlists'
  ];

  const foundData = keysToCheck.filter(key => {
    const data = localStorage.getItem(key);
    return data && data !== '[]' && data !== 'null';
  });

  if (foundData.length > 0) {
    console.log('📋 Datos encontrados en localStorage:', foundData);
    return foundData;
  }

  console.log('✅ No hay datos pendientes en localStorage');
  return [];
};
