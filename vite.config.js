import { defineConfig } from 'vite';
import { preact } from 'vite-plugin-preact';

export default defineConfig({
  build: {
    lib: {
      entry: 'webview-src/main.tsx',
      name: 'TategakiEditor',
      fileName: 'webview',
      formats: ['es']
    },
    outDir: 'webview-dist',
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'webview.js',
        assetFileNames: 'webview.[ext]'
      }
    },
    minify: false, // Keep readable for debugging
    sourcemap: true
  },
  plugins: [preact()],
  define: {
    global: 'globalThis'
  }
});