#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing build process...');

try {
  // Verificar que estamos en el directorio correcto
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found. Please run this script from the project root.');
  }

  // Verificar que las dependencias están instaladas
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install --prefer-offline --no-audit --no-fund --no-optional', { stdio: 'inherit' });
  }

  // Limpiar build anterior
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Ejecutar build
  console.log('🏗️ Running build...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verificar que el build fue exitoso
  if (fs.existsSync('dist')) {
    const files = fs.readdirSync('dist');
    console.log('✅ Build successful!');
    console.log('📁 Build output files:', files);
    
    // Verificar archivos críticos
    const criticalFiles = ['index.html'];
    for (const file of criticalFiles) {
      if (fs.existsSync(path.join('dist', file))) {
        console.log(`✅ ${file} exists`);
      } else {
        console.warn(`⚠️ ${file} missing`);
      }
    }
  } else {
    throw new Error('Build output directory not found');
  }

} catch (error) {
  console.error('❌ Build test failed:', error.message);
  process.exit(1);
} 