import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Función para hacer pruebas de los endpoints
async function testEndpoint(method, endpoint, description) {
  try {
    log('blue', `\n🧪 Probando: ${description}`);
    log('yellow', `   ${method} ${BACKEND_URL}${endpoint}`);
    
    const response = await axios({
      method,
      url: `${BACKEND_URL}${endpoint}`,
      timeout: 10000
    });
    
    log('green', `   ✅ Status: ${response.status}`);
    log('green', `   📊 Resultados: ${response.data.results?.length || 'N/A'}`);
    
    if (response.data.results?.[0]) {
      const track = response.data.results[0];
      log('blue', `   🎵 Ejemplo: "${track.name}" - ${track.artist_name}`);
    }
    
    return true;
  } catch (error) {
    log('red', `   ❌ Error: ${error.message}`);
    if (error.response) {
      log('red', `   📄 Status: ${error.response.status}`);
      log('red', `   📝 Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function runTests() {
  log('bright', '🚀 Iniciando pruebas del backend StreamFlow...\n');
  
  const tests = [
    ['GET', '/', 'Endpoint raíz - información del servidor'],
    ['GET', '/api/search?q=coldplay&limit=3', 'Búsqueda de canciones'],
    ['GET', '/api/chart?limit=5', 'Top charts'],
    ['GET', '/api/track/3135556', 'Detalles de canción específica'],
    ['GET', '/api/artist/search?q=daft%20punk&limit=3', 'Búsqueda de artistas'],
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [method, endpoint, description] of tests) {
    const success = await testEndpoint(method, endpoint, description);
    if (success) passed++;
    else failed++;
    
    // Pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  log('bright', `\n📊 Resumen de pruebas:`);
  log('green', `   ✅ Exitosas: ${passed}`);
  log('red', `   ❌ Fallidas: ${failed}`);
  
  if (failed === 0) {
    log('green', '\n🎉 ¡Todas las pruebas pasaron! El backend está funcionando correctamente.');
  } else {
    log('yellow', '\n⚠️  Algunas pruebas fallaron. Verifica que el servidor esté corriendo en el puerto 3001.');
  }
}

// Verificar si el servidor está corriendo
async function checkServer() {
  try {
    await axios.get(`${BACKEND_URL}/`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Ejecutar pruebas
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('red', '❌ El servidor no está corriendo en http://localhost:3001');
    log('yellow', '\n📝 Para iniciar el servidor:');
    log('blue', '   cd backend');
    log('blue', '   npm install');
    log('blue', '   npm run dev');
    log('yellow', '\nLuego ejecuta este script nuevamente.');
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error);
