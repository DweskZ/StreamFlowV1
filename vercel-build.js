#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Vercel build process...');

try {
  // Limpiar caché de npm si existe
  console.log('🧹 Cleaning npm cache...');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Cache clean failed, continuing...');
  }

  // Instalar dependencias con configuración específica
  console.log('📦 Installing dependencies...');
  execSync('npm ci --prefer-offline --no-audit --no-fund --no-optional', { stdio: 'inherit' });

  // Verificar que las dependencias críticas estén instaladas
  console.log('🔍 Verifying critical dependencies...');
  const criticalDeps = ['vite', '@vitejs/plugin-react-swc', 'react', 'react-dom'];
  
  for (const dep of criticalDeps) {
    try {
      require.resolve(dep);
      console.log(`✅ ${dep} is available`);
    } catch (error) {
      console.error(`❌ ${dep} is missing, reinstalling...`);
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
    }
  }

  // Ejecutar el build
  console.log('🏗️ Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verificar que el build fue exitoso
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Build completed successfully!');
    console.log(`📁 Build output: ${distPath}`);
  } else {
    throw new Error('Build output directory not found');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 