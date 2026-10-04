import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'],
      manifest: {
        name: 'Budget2Go',
        short_name: 'Budget2Go',
        description: 'Personal Finance Manager — track income, expenses, savings, and loans offline.',
        theme_color: '#F7F8FA',
        background_color: '#F7F8FA',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icon.png',
            sizes: '1254x1254',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});
