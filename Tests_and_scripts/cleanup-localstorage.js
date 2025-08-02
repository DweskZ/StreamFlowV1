// Script para limpiar localStorage de datos migrados a Supabase
// Ejecuta este script en la consola del navegador

(function() {
  console.log('🧹 Iniciando limpieza de localStorage...');
  
  // Claves que ya no se usan porque los datos están en Supabase
  const keysToRemove = [
    'sf_liked_songs',      // Favoritos migrados a user_favorites
    'sf_playlists',        // Playlists migradas a user_playlists
  ];

  let cleanedCount = 0;
  
  keysToRemove.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      localStorage.removeItem(key);
      console.log(`✅ Limpiado: ${key}`);
      console.log(`   Datos encontrados: ${data.length} caracteres`);
      cleanedCount++;
    } else {
      console.log(`ℹ️  No hay datos en: ${key}`);
    }
  });

  // Verificar otras claves que podrían estar en uso
  const allKeys = Object.keys(localStorage);
  const sfKeys = allKeys.filter(key => key.startsWith('sf_'));
  
  console.log('\n📋 Todas las claves de StreamFlow en localStorage:');
  sfKeys.forEach(key => {
    const data = localStorage.getItem(key);
    const size = data ? data.length : 0;
    console.log(`   ${key}: ${size} caracteres`);
  });

  console.log(`\n🎉 Limpieza completada. ${cleanedCount} claves eliminadas.`);
  
  // Verificar si quedan datos
  const remainingData = keysToRemove.filter(key => localStorage.getItem(key));
  if (remainingData.length === 0) {
    console.log('✅ Todos los datos migrados han sido limpiados correctamente.');
  } else {
    console.log('⚠️  Algunos datos no pudieron ser limpiados:', remainingData);
  }
})(); 