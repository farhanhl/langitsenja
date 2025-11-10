import { defineConfig } from 'vite';
import { resolve } from 'path';

// Hanya aktifkan obfuscation untuk production build
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  root: '.', // Root directory adalah project root
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser', // Gunakan terser untuk minifikasi
    terserOptions: {
      // Konfigurasi untuk membuat kode lebih sulit dibaca
      compress: {
        drop_console: true, // Hapus console.log
        drop_debugger: true, // Hapus debugger
        unused: true,
        dead_code: true,
      },
      mangle: {
        // Acak nama variabel
        properties: false, // Kita set ke false agar tidak merusak Three.js property
      },
      format: {
        comments: false, // Hilangkan komentar
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // Entry point utama
      },
      external: ['three'], // Eksklusikan three dari bundle karena menggunakan CDN
      output: {
        // Konfigurasi untuk output
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
  },
});