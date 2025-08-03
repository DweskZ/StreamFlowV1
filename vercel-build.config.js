// Configuración específica para el build de Vercel
module.exports = {
  // Configuración de entorno
  env: {
    NODE_ENV: 'production',
    VITE_APP_ENV: 'production',
    VITE_BUILD_OPTIMIZE: 'true',
    VITE_SOURCEMAP: 'false'
  },
  
  // Configuración de build
  build: {
    // Usar esbuild en lugar de rollup para evitar problemas
    minify: 'esbuild',
    target: 'esnext',
    // Configuración específica para evitar problemas con dependencias opcionales
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
        },
      },
    },
  },
  
  // Configuración de dependencias
  dependencies: {
    // Forzar instalación de dependencias críticas
    critical: ['vite', '@vitejs/plugin-react-swc', 'react', 'react-dom'],
    // Excluir dependencias problemáticas
    exclude: ['@rollup/rollup-linux-x64-gnu']
  }
}; 