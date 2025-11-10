import { defineConfig } from 'vite';
import { resolve } from 'path';

// Hanya aktifkan obfuscation untuk production build
const isProduction = process.env.NODE_ENV === 'production';

// Impor plugin obfuscator dan konfigurasinya
const obfuscatorPlugin = isProduction ? [
  require('rollup-plugin-javascript-obfuscator')(require('./obfuscator.config.js'))
] : [];

export default defineConfig({
  root: '.', // Root directory adalah project root
  publicDir: 'public', // Gunakan folder public untuk file statis
  base: './', // Gunakan path relative agar bisa deploy di subfolder
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
        // Tambahkan kompresi lebih agresif
        ecma: 2020,
        inline: 2,
        passes: 3,
        keep_fargs: false,
        keep_fnames: false,
      },
      mangle: {
        // Acak nama variabel dan fungsi
        properties: false, // Kita tetap set ke false agar tidak merusak Three.js property
        keep_fnames: false,
        reserved: [], // Jangan ada variabel yang dikecualikan dari mangle
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
      plugins: obfuscatorPlugin, // Tambahkan plugin obfuscator
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