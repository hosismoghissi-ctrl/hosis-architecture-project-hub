import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'assets',
  server: { host: '0.0.0.0', port: 4173, allowedHosts: ['terminal.local'] },
  build: { outDir: 'dist', rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom'], map: ['maplibre-gl'], three: ['three'] } } } }
});
