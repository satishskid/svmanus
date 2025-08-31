import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        // Define caching strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.cdc\.gov\/growthcharts\/data\/zscore\/.*/i,
            handler: 'CacheFirst', // For WHO data CSVs
            options: {
              cacheName: 'who-data-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst', // Images
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css|html)$/i,
            handler: 'StaleWhileRevalidate', // Static assets
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 Day
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst', // HTML documents
            options: {
              cacheName: 'html-cache',
            },
          },
          // For IndexedDB data, Dexie handles caching internally, so no explicit Workbox rule is needed.
          // For API calls, if there were external APIs, a NetworkFirst strategy would be used.
          // For analytics, a CacheOnly strategy would be used if an analytics library was integrated.
        ],
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 4444
  }
})
