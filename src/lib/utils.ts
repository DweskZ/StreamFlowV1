import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
