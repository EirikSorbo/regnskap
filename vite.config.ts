import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/regnskap/',
  build: {
    rollupOptions: {
      output: {
        // Skill ut de tunge, sjelden-endrede bibliotekene i egne vendor-chunks,
        // så app-koden og Firebase/React caches hver for seg mellom oppdateringer.
        // rolldown-vite tar kun funksjonsformen av manualChunks.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase'
          if (id.includes('/react-router') || id.includes('/react-dom/') ||
              id.includes('/react/') || id.includes('/scheduler/')) return 'react'
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Regnskap',
        short_name: 'Regnskap',
        description: 'Enkel regnskapsapp for enkeltpersonforetak',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
