import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192x192.png', 'icon-512x512.png'],
      // Disable manifest generation since we have one in public/
      // manifest: {
      //   name: 'She&Her - AI Healthcare Companion',
      //   short_name: 'She&Her',
      //   description: 'AI-powered women\'s healthcare consultations and expert guidance',
      //   theme_color: '#ec4899',
      //   background_color: '#ffffff',
      //   display: 'standalone',
      //   orientation: 'portrait',
      //   scope: '/',
      //   start_url: '/',
      //   icons: [
      //     {
      //       src: 'icon-192x192.png',
      //       sizes: '192x192',
      //       type: 'image/png',
      //       purpose: 'maskable any'
      //     },
      //     {
      //       src: 'icon-512x512.png',
      //       sizes: '512x512',
      //       type: 'image/png',
      //       purpose: 'maskable any'
      //     }
      //   ]
      // },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Only cache same-origin API requests, not external APIs
          {
            urlPattern: ({ url }) => url.origin === location.origin && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          // Exclude external API requests from caching
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'external-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 // Only cache for 1 minute
              }
            }
          }
        ],
        // Add navigation fallback for SPA routing
        navigateFallback: '/index.html',
        // Exclude external API requests from caching attempts
        mode: 'production'
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 7123,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'convex/_generated/api': path.resolve(__dirname, './convex/_generated/api.js'),
    },
  },
  envPrefix: 'VITE_',
})