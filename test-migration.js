#!/usr/bin/env node
/**
 * Script de prueba rápida para verificar la migración a Deezer
 */

import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

console.log('🧪 Verificando migración a Deezer...\n');

async function testBackend() {
  try {
    console.log('1️⃣ Probando conexión al backend...');
    const healthResponse = await axios.get(`${BACKEND_URL}/`);
    console.log('✅ Backend conectado:', healthResponse.data.message);
    
    console.log('\n2️⃣ Probando búsqueda de canciones...');
    const searchResponse = await axios.get(`${BACKEND_URL}/api/search?q=coldplay&limit=3`);
    console.log('✅ Búsqueda exitosa. Resultados:', searchResponse.data.results.length);
    
    if (searchResponse.data.results.length > 0) {
      const track = searchResponse.data.results[0];
      console.log(`   🎵 Ejemplo: "${track.name}" - ${track.artist_name}`);
      console.log(`   🖼️ Imagen: ${track.album_image ? '✅' : '❌'}`);
      console.log(`   🔊 Audio: ${track.audio ? '✅' : '❌'}`);
    }
    
    console.log('\n3️⃣ Probando charts...');
    const chartResponse = await axios.get(`${BACKEND_URL}/api/chart?limit=3`);
    console.log('✅ Charts obtenidos. Resultados:', chartResponse.data.results.length);
    
    console.log('\n✅ ¡Migración completada exitosamente!');
    console.log('🎯 El frontend ahora puede usar el backend con Deezer.');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solución: Inicia el backend primero:');
      console.log('   cd backend');
      console.log('   npm install');
      console.log('   npm run dev');
    }
  }
}

testBackend();
