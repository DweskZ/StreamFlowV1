// Script para limpiar datos de localStorage de usuarios específicos
// Ejecuta este script en la consola del navegador

(function() {
  console.log('🧹 Iniciando limpieza de datos de usuarios...');
  
  // Función para obtener todas las claves de localStorage
  const getAllKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys.filter(key => key !== null);
  };

  // Función para limpiar datos de un usuario específico
  const clearUserData = (userId) => {
    const keysToRemove = [
      `sf_queue_v1_${userId}`,
      `sf_player_state_v1_${userId}`,
      `sf_liked_songs_${userId}`,
      `sf_playlists_${userId}`
    ];

    let removedCount = 0;
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Eliminado: ${key}`);
        removedCount++;
      }
    });

    return removedCount;
  };

  // Función para limpiar datos de usuario anónimo
  const clearAnonymousData = () => {
    const keysToRemove = [
      'sf_queue_v1_anonymous',
      'sf_player_state_v1_anonymous',
      'sf_liked_songs',
      'sf_playlists'
    ];

    let removedCount = 0;
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Eliminado: ${key}`);
        removedCount++;
      }
    });

    return removedCount;
  };

  // Mostrar todas las claves de StreamFlow
  const allKeys = getAllKeys();
  const sfKeys = allKeys.filter(key => key.startsWith('sf_'));
  
  console.log('\n📋 Claves de StreamFlow encontradas:');
  sfKeys.forEach(key => {
    const data = localStorage.getItem(key);
    const size = data ? data.length : 0;
    console.log(`   ${key}: ${size} caracteres`);
  });

  // Mostrar opciones de limpieza
  console.log('\n🎯 Opciones de limpieza:');
  console.log('1. clearUserData("USER_ID") - Limpiar datos de un usuario específico');
  console.log('2. clearAnonymousData() - Limpiar datos de usuario anónimo');
  console.log('3. clearAllUserData() - Limpiar todos los datos de usuarios');

  // Función para limpiar todos los datos de usuarios
  window.clearAllUserData = () => {
    const allKeys = getAllKeys();
    const userKeys = allKeys.filter(key => 
      key.startsWith('sf_queue_v1_') || 
      key.startsWith('sf_player_state_v1_') ||
      key.startsWith('sf_liked_songs_') ||
      key.startsWith('sf_playlists_')
    );

    let totalRemoved = 0;
    userKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Eliminado: ${key}`);
      totalRemoved++;
    });

    console.log(`\n🎉 Limpieza completada. ${totalRemoved} claves eliminadas.`);
    return totalRemoved;
  };

  // Hacer las funciones disponibles globalmente
  window.clearUserData = clearUserData;
  window.clearAnonymousData = clearAnonymousData;

  console.log('\n✅ Funciones disponibles:');
  console.log('- clearUserData(userId)');
  console.log('- clearAnonymousData()');
  console.log('- clearAllUserData()');
  
  console.log('\n💡 Ejemplo: clearUserData("12345678-1234-1234-1234-123456789012")');
})(); 