import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isElectron = process.env.BUILD_TARGET === 'electron';
const isMobile   = process.env.BUILD_TARGET === 'mobile';
const isNative   = isElectron || isMobile;

export default defineConfig({
  plugins: [
    react(),

    // PWA solo para la versión web — en Electron/Capacitor el SW no aplica
    !isNative && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Atout',
        short_name: 'Atout',
        description: 'Tu estudio freelance, organizado. Para developers y community managers.',
        theme_color: '#7C3AED',
        background_color: '#F8F6FF',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        categories: ['productivity', 'business'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),

  // Base relativa para Electron y Capacitor (necesitan rutas relativas al sistema de archivos)
  base: isNative ? './' : '/',

  build: {
    // Electron y Capacitor no necesitan el inline threshold alto
    assetsInlineLimit: isNative ? 0 : 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'vendor';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('lucide-react') || id.includes('date-fns')) return 'ui';
          if (id.includes('html2canvas') || id.includes('jspdf')) return 'pdf';
        },
      },
    },
  },
});
